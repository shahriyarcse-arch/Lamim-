import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';

/** OWASP 2024 argon2id baseline: 19 MiB, t=2, p=1. */
export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const hashPassword = (password: string): Promise<string> =>
  argon2.hash(password, ARGON2_OPTIONS);

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/** Opaque refresh token: 32 random bytes, base64url (43 chars). Only its sha256 is stored. */
export const newRefreshToken = (): string => randomBytes(32).toString('base64url');

export const sha256Hex = (value: string): string =>
  createHash('sha256').update(value, 'utf8').digest('hex');

export type RevokeReason = 'rotated' | 'logout' | 'reuse';

/** A rotated parent presented again within this window (two tabs refreshing at once) is benign. */
export const REFRESH_GRACE_MS = 30_000;

export interface StoredRefreshToken {
  expiresAt: Date;
  revokedAt: Date | null;
  revokeReason: string | null;
}

/**
 * rotate  — live token: rotate it.
 * grace   — just rotated (< 30 s ago): concurrent refresh; mint a sibling in the same family.
 * reuse   — rotated long ago and presented again: it leaked; revoke the whole family.
 * revoked — ended by logout / an earlier reuse revocation: plain 401, revoke nothing else.
 */
export type RefreshDecision = 'rotate' | 'grace' | 'reuse' | 'revoked' | 'unknown' | 'expired';

export function decideRefresh(token: StoredRefreshToken | null, now: Date): RefreshDecision {
  if (!token) return 'unknown';
  if (token.revokedAt) {
    if (token.revokeReason !== 'rotated') return 'revoked';
    if (now.getTime() - token.revokedAt.getTime() <= REFRESH_GRACE_MS) {
      return token.expiresAt.getTime() > now.getTime() ? 'grace' : 'expired';
    }
    return 'reuse';
  }
  if (token.expiresAt.getTime() <= now.getTime()) return 'expired';
  return 'rotate';
}
