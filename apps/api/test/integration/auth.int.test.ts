import { AuthResponseSchema } from '@lamim/sync-protocol';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import { sha256Hex } from '../../src/auth/tokens';
import { PrismaService } from '../../src/prisma/prisma.service';
import { rid, startApp } from '../helpers';

const schema = inject('dbSchema');

describe.skipIf(!schema)('auth (integration, isolated schema)', () => {
  let app: NestExpressApplication;
  const http = () => request(app.getHttpServer());
  const email = `${rid('auth')}@example.test`;
  const password = 'correct horse battery staple';

  beforeAll(async () => {
    app = await startApp({ DB_SCHEMA: schema });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('registers (email normalised) and rejects a duplicate with 409', async () => {
    const res = await http()
      .post('/auth/register')
      .send({ email: `  ${email.toUpperCase()} `, password, deviceId: 'devA' });
    expect(res.status).toBe(201);
    const body = AuthResponseSchema.parse(res.body);
    expect(body.user.email).toBe(email);
    expect(body.expiresIn).toBe(900);

    const dup = await http().post('/auth/register').send({ email, password, deviceId: 'devB' });
    expect(dup.status).toBe(409);
    expect(dup.body.message).toBe('Email already registered');
  });

  it('login errors are identical for a wrong password and an unknown email', async () => {
    const wrong = await http()
      .post('/auth/login')
      .send({ email, password: 'wrong password', deviceId: 'devA' });
    const unknown = await http()
      .post('/auth/login')
      .send({ email: `${rid('nobody')}@example.test`, password, deviceId: 'devA' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
    expect(wrong.body.message).toBe('Invalid email or password');
  });

  it('access token authorises /sync; garbage does not', async () => {
    const login = await http().post('/auth/login').send({ email, password, deviceId: 'devA' });
    expect(login.status).toBe(200);
    const ok = await http()
      .get('/sync/pull')
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(ok.status).toBe(200);
    const tampered = `${login.body.accessToken.slice(0, -2)}xx`;
    expect((await http().get('/sync/pull').set('Authorization', `Bearer ${tampered}`)).status).toBe(
      401,
    );
  });

  /** Pretend `token` was rotated `ms` ago (beyond the 30 s grace window). */
  const ageRotation = (token: string, ms: number) =>
    app.get(PrismaService).refreshToken.updateMany({
      where: { tokenHash: sha256Hex(token) },
      data: { revokedAt: new Date(Date.now() - ms) },
    });
  const refresh = (refreshToken: string) => http().post('/auth/refresh').send({ refreshToken });
  const login = async (deviceId: string) =>
    (await http().post('/auth/login').send({ email, password, deviceId })).body
      .refreshToken as string;

  it('rotates refresh tokens; two tabs refreshing the same token within the grace window both succeed', async () => {
    const t1 = await login('devA');
    const [a, b] = await Promise.all([refresh(t1), refresh(t1)]);
    expect([a.status, b.status]).toEqual([200, 200]);
    const ta = AuthResponseSchema.parse(a.body).refreshToken;
    const tb = AuthResponseSchema.parse(b.body).refreshToken;
    expect(new Set([t1, ta, tb]).size).toBe(3);
    // Both children are live members of the same family.
    expect((await refresh(ta)).status).toBe(200);
    expect((await refresh(tb)).status).toBe(200);
  });

  it('replaying a token rotated long ago revokes only that family', async () => {
    const other = await login('devOther'); // a separate session (family)
    const t1 = await login('devA');
    const r1 = await refresh(t1);
    const t2 = AuthResponseSchema.parse(r1.body).refreshToken;
    await ageRotation(t1, 60_000);

    expect((await refresh(t1)).status).toBe(401); // theft signal
    expect((await refresh(t2)).status).toBe(401); // its family is dead
    expect((await refresh(other)).status).toBe(200); // other sessions survive
  });

  it('logout ends the session: later refreshes are plain 401s that revoke nothing else', async () => {
    const other = await login('devOther2');
    const token = await login('devC');
    expect((await http().post('/auth/logout').send({ refreshToken: token })).status).toBe(204);
    expect((await http().post('/auth/logout').send({ refreshToken: token })).status).toBe(204);
    await ageRotation(token, 60_000);
    expect((await refresh(token)).status).toBe(401);
    expect((await refresh(other)).status).toBe(200);
    const reasons = await app.get(PrismaService).refreshToken.findMany({
      where: { tokenHash: sha256Hex(token) },
      select: { revokeReason: true },
    });
    expect(reasons).toEqual([{ revokeReason: 'logout' }]);
  });
});
