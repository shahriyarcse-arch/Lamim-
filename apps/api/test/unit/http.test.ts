/** HTTP-surface tests that never reach the database (Prisma connects lazily). */
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startApp } from '../helpers';

describe('HTTP surface (no database)', () => {
  let app: NestExpressApplication;
  beforeAll(async () => {
    app = await startApp({
      DATABASE_URL: 'postgresql://user:pass@127.0.0.1:1/none',
      RATE_LIMIT_AUTH_PER_MIN: '3',
    });
  });
  afterAll(async () => {
    await app.close();
  });

  it('GET /health → ok with security headers', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('CORS allows only listed origins', async () => {
    const ok = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'http://localhost:3000');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    const evil = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'https://evil.example');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('sync endpoints require a valid bearer token', async () => {
    expect((await request(app.getHttpServer()).get('/sync/pull')).status).toBe(401);
    const bad = await request(app.getHttpServer())
      .post('/sync/push')
      .set('Authorization', 'Bearer a.b.c')
      .send({});
    expect(bad.status).toBe(401);
  });

  it('rejects malformed JSON and bodies over 1 MB', async () => {
    const malformed = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Content-Type', 'application/json')
      .send('{"refreshToken":');
    expect(malformed.status).toBe(400);
    const huge = await request(app.getHttpServer())
      .post('/health')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ x: 'a'.repeat(1_100_000) }));
    expect(huge.status).toBe(413);
  });

  it('auth: invalid input → 400 without echoing values; 4th request in a minute → 429 + Retry-After', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'nope', password: 'hunter2', deviceId: 'd' });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toContain('hunter2');
    await request(app.getHttpServer()).post('/auth/login').send({});
    await request(app.getHttpServer()).post('/auth/refresh').send({});
    const limited = await request(app.getHttpServer()).post('/auth/login').send({});
    expect(limited.status).toBe(429);
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
  });
});

describe('per-email auth limit (no database)', () => {
  let app: NestExpressApplication;
  beforeAll(async () => {
    app = await startApp({
      DATABASE_URL: 'postgresql://user:pass@127.0.0.1:1/none',
      RATE_LIMIT_EMAIL_PER_15MIN: '3',
    });
  });
  afterAll(async () => {
    await app.close();
  });

  it('limits login/register attempts per normalised email across IPs, independent of other emails', async () => {
    const http = () => request(app.getHttpServer());
    // Invalid deviceId → 400 after the guard has counted the attempt; no DB involved.
    const attempt = (path: string, email: string, ip: string) =>
      http()
        .post(path)
        .set('X-Forwarded-For', ip)
        .send({ email, password: 'short', deviceId: 'not valid!' });
    expect((await attempt('/auth/register', 'Victim@Example.com', '198.51.100.1')).status).toBe(
      400,
    );
    expect((await attempt('/auth/login', 'victim@example.com', '198.51.100.2')).status).toBe(400);
    expect((await attempt('/auth/register', ' VICTIM@example.com ', '198.51.100.3')).status).toBe(
      400,
    );
    const limited = await attempt('/auth/login', 'victim@example.com', '198.51.100.4');
    expect(limited.status).toBe(429);
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
    expect((await attempt('/auth/login', 'someone-else@example.com', '198.51.100.4')).status).toBe(
      400,
    );
  });
});
