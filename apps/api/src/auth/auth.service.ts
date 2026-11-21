import { randomUUID } from 'node:crypto';
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  type AuthResponse,
  REFRESH_TOKEN_TTL_SECONDS,
} from '@lamim/sync-protocol';
import { JsonLogger, LOGGER } from '../common/logger';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { decideRefresh, hashPassword, newRefreshToken, sha256Hex, verifyPassword } from './tokens';

const INVALID_LOGIN = 'Invalid email or password';
const INVALID_REFRESH = 'Invalid or expired refresh token';
/** Room to open a fresh pooled connection (TLS to Neon) and to wait out a concurrent rotation. */
const TX_OPTIONS = { maxWait: 5_000, timeout: 10_000 } as const;

@Injectable()
export class AuthService {
  /** Verified against when the email is unknown so both login paths cost one argon2 verify. */
  private readonly dummyHash: Promise<string>;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(LOGGER) private readonly logger: JsonLogger,
  ) {
    this.dummyHash = hashPassword(newRefreshToken());
  }

  async register(input: {
    email: string;
    password: string;
    deviceId: string;
  }): Promise<AuthResponse> {
    const passwordHash = await hashPassword(input.password);
    let user: { id: string; email: string };
    try {
      user = await this.prisma.user.create({
        data: { email: input.email, passwordHash },
        select: { id: true, email: true },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }
    this.logger.event('info', 'auth.register', { userId: user.id });
    return this.issue(user, input.deviceId, randomUUID());
  }

  async login(input: { email: string; password: string; deviceId: string }): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, passwordHash: true },
    });
    const ok = await verifyPassword(user?.passwordHash ?? (await this.dummyHash), input.password);
    if (!user || !ok) {
      this.logger.event('warn', 'auth.login_failed', { known: Boolean(user) });
      throw new UnauthorizedException(INVALID_LOGIN);
    }
    this.logger.event('info', 'auth.login', { userId: user.id });
    return this.issue(user, input.deviceId, randomUUID());
  }

  async refresh(rawToken: string): Promise<AuthResponse> {
    const now = new Date();
    const tokenHash = sha256Hex(rawToken);
    const outcome = await this.prisma.$transaction(async (tx) => {
      const load = () =>
        tx.refreshToken.findUnique({
          where: { tokenHash },
          include: { user: { select: { id: true, email: true } } },
        });
      let stored = await load();
      let decision = decideRefresh(stored, now);

      if (stored && decision === 'rotate') {
        // Conditional revoke: of two concurrent refreshes only one claims the rotation; the
        // other re-reads and lands in the grace path instead of tripping reuse detection.
        const childId = randomUUID();
        const claimed = await tx.refreshToken.updateMany({
          where: { id: stored.id, revokedAt: null },
          data: { revokedAt: now, revokeReason: 'rotated', replacedBy: childId },
        });
        if (claimed.count === 1) {
          const refreshToken = await this.mintInFamily(tx, stored, now, childId);
          return { kind: 'ok' as const, user: stored.user, refreshToken };
        }
        stored = await load();
        decision = decideRefresh(stored, now);
      }
      if (!stored) return { kind: 'invalid' as const };
      if (decision === 'grace') {
        // Just-rotated parent presented again (second tab): a fresh sibling in the same family.
        const refreshToken = await this.mintInFamily(tx, stored, now, randomUUID());
        return { kind: 'ok' as const, user: stored.user, refreshToken };
      }
      if (decision === 'reuse') {
        await tx.refreshToken.updateMany({
          where: { familyId: stored.familyId, revokedAt: null },
          data: { revokedAt: now, revokeReason: 'reuse' },
        });
        return { kind: 'reuse' as const, userId: stored.userId, familyId: stored.familyId };
      }
      return { kind: 'invalid' as const }; // unknown | expired | revoked (logout / earlier reuse)
    }, TX_OPTIONS);

    if (outcome.kind === 'reuse') {
      this.logger.event('warn', 'auth.refresh_reuse_detected', {
        userId: outcome.userId,
        familyId: outcome.familyId,
      });
      throw new UnauthorizedException(INVALID_REFRESH);
    }
    if (outcome.kind === 'invalid') throw new UnauthorizedException(INVALID_REFRESH);
    return {
      accessToken: await this.signAccess(outcome.user.id),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      refreshToken: outcome.refreshToken,
      user: outcome.user,
    };
  }

  private async mintInFamily(
    tx: Prisma.TransactionClient,
    parent: { userId: string; familyId: string; deviceId: string },
    now: Date,
    id: string,
  ): Promise<string> {
    const refreshToken = newRefreshToken();
    await tx.refreshToken.create({
      data: {
        id,
        userId: parent.userId,
        tokenHash: sha256Hex(refreshToken),
        familyId: parent.familyId,
        deviceId: parent.deviceId,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });
    return refreshToken;
  }

  /**
   * Ends the session: every live token in the presented token's family is revoked with reason
   * "logout". Idempotent; unknown tokens are a no-op. A later refresh with them is a plain 401.
   */
  async logout(rawToken: string): Promise<void> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: sha256Hex(rawToken) },
      select: { familyId: true },
    });
    if (!stored) return;
    await this.prisma.refreshToken.updateMany({
      where: { familyId: stored.familyId, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: 'logout' },
    });
  }

  private signAccess(userId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, typ: 'access' },
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );
  }

  private async issue(
    user: { id: string; email: string },
    deviceId: string,
    familyId: string,
  ): Promise<AuthResponse> {
    const refreshToken = newRefreshToken();
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256Hex(refreshToken),
          familyId,
          deviceId,
          expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000),
        },
      }),
      this.prisma.device.upsert({
        where: { userId_id: { userId: user.id, id: deviceId } },
        create: { userId: user.id, id: deviceId },
        update: { lastSeenAt: now },
      }),
    ]);
    return {
      accessToken: await this.signAccess(user.id),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      refreshToken,
      user,
    };
  }
}
