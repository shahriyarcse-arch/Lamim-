import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  type OnModuleDestroy,
} from '@nestjs/common';
import { isIPv6 } from 'node:net';
import type { NextFunction, Request, Response } from 'express';
import { APP_CONFIG, type AppConfig } from '../config';

export interface HitResult {
  allowed: boolean;
  remaining: number;
  /** Whole seconds until the oldest hit leaves the window (0 when allowed). */
  retryAfterSec: number;
}

/**
 * Sliding-window-log limiter: at most `limit` hits per key in any rolling `windowMs`.
 * In-memory (single instance); swap the Map for Redis when the API scales out.
 * Blocked hits are not recorded, so a client that backs off recovers on schedule.
 */
export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    readonly limit: number,
    readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  hit(key: string): HitResult {
    const t = this.now();
    const cutoff = t - this.windowMs;
    let log = this.hits.get(key);
    if (!log) {
      log = [];
      this.hits.set(key, log);
    }
    while (log.length > 0 && (log[0] as number) <= cutoff) log.shift();
    if (log.length >= this.limit) {
      const oldest = log[0] as number;
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec: Math.max(1, Math.ceil((oldest + this.windowMs - t) / 1000)),
      };
    }
    log.push(t);
    return { allowed: true, remaining: this.limit - log.length, retryAfterSec: 0 };
  }

  /** Drop keys whose whole log has aged out (bounded memory). */
  sweep(): void {
    const cutoff = this.now() - this.windowMs;
    for (const [key, log] of this.hits) {
      if (log.length === 0 || (log[log.length - 1] as number) <= cutoff) this.hits.delete(key);
    }
  }

  get size(): number {
    return this.hits.size;
  }
}

const MINUTE = 60_000;

const MINUTES_15 = 15 * MINUTE;

/** 429 carrying a Retry-After value; the exception filter turns it into the header. */
export class TooManyRequestsException extends HttpException {
  constructor(
    readonly retryAfterSec: number,
    message = 'Rate limit exceeded',
  ) {
    super({ statusCode: 429, error: 'Too Many Requests', message }, HttpStatus.TOO_MANY_REQUESTS);
  }
}

/** Expand an IPv6 address to its 8 hextets (no validation beyond what isIPv6 guarantees). */
function expandIpv6(ip: string): string[] {
  const [head = '', tail] = ip.split('::');
  const h = head ? head.split(':') : [];
  const t = tail !== undefined && tail !== '' ? tail.split(':') : [];
  const fill = tail === undefined ? [] : Array<string>(8 - h.length - t.length).fill('0');
  return [...h, ...fill, ...t];
}

/**
 * Rate-limit key for an address. IPv4 (and IPv4-mapped IPv6) keys by address; native IPv6
 * keys by its /64 prefix, since one subscriber is routinely handed a whole /64.
 */
export function ipKey(raw: string): string {
  const ip = raw.split('%')[0] ?? raw; // drop zone id
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped?.[1]) return mapped[1];
  if (!isIPv6(ip)) return ip;
  const groups = expandIpv6(ip.toLowerCase())
    .slice(0, 4)
    .map((g) => (g.includes('.') ? '0' : g.replace(/^0+(?=.)/, '')));
  return `${groups.join(':')}::/64`;
}

export function clientIp(req: Request): string {
  return ipKey(req.ip ?? req.socket.remoteAddress ?? 'unknown');
}

function reject(result: HitResult): never {
  throw new TooManyRequestsException(result.retryAfterSec);
}

@Injectable()
export class RateLimitService implements OnModuleDestroy {
  readonly auth: SlidingWindowLimiter;
  readonly sync: SlidingWindowLimiter;
  readonly global: SlidingWindowLimiter;
  readonly email: SlidingWindowLimiter;
  private readonly timer: NodeJS.Timeout;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.auth = new SlidingWindowLimiter(config.RATE_LIMIT_AUTH_PER_MIN, MINUTE);
    this.sync = new SlidingWindowLimiter(config.RATE_LIMIT_SYNC_PER_MIN, MINUTE);
    this.global = new SlidingWindowLimiter(config.RATE_LIMIT_GLOBAL_PER_MIN, MINUTE);
    this.email = new SlidingWindowLimiter(config.RATE_LIMIT_EMAIL_PER_15MIN, MINUTES_15);
    this.timer = setInterval(() => {
      this.email.sweep();
      this.auth.sweep();
      this.sync.sweep();
      this.global.sweep();
    }, MINUTE);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  /** Express middleware: 300 req/min/IP across every route. */
  globalMiddleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const result = this.global.hit(clientIp(req));
      if (!result.allowed) {
        res.setHeader('Retry-After', String(result.retryAfterSec));
        res
          .status(429)
          .json({ statusCode: 429, error: 'Too Many Requests', message: 'Rate limit exceeded' });
        return;
      }
      next();
    };
  }
}

/** 10 req/min per IP on /auth/*. */
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(@Inject(RateLimitService) private readonly limits: RateLimitService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const http = ctx.switchToHttp();
    const req = http.getRequest<Request>();
    const result = this.limits.auth.hit(`auth:${clientIp(req)}`);
    if (!result.allowed) reject(result);
    return true;
  }
}

/**
 * Login/register attempts per normalised email (5 / 15 min by default), on top of the per-IP
 * limit, so one account cannot be brute-forced or probed from many addresses.
 */
@Injectable()
export class EmailRateLimitGuard implements CanActivate {
  constructor(@Inject(RateLimitService) private readonly limits: RateLimitService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const email: unknown = (req.body as { email?: unknown } | undefined)?.email;
    // Invalid / missing emails are rejected by validation later; nothing to key on.
    if (typeof email !== 'string' || email.length > 320) return true;
    const result = this.limits.email.hit(`email:${email.trim().toLowerCase()}`);
    if (!result.allowed) reject(result);
    return true;
  }
}

/** 60 req/min per authenticated user on /sync/*. Must run after JwtAuthGuard. */
@Injectable()
export class SyncRateLimitGuard implements CanActivate {
  constructor(@Inject(RateLimitService) private readonly limits: RateLimitService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const http = ctx.switchToHttp();
    const req = http.getRequest<Request & { userId?: string }>();
    const result = this.limits.sync.hit(`sync:${req.userId ?? clientIp(req)}`);
    if (!result.allowed) reject(result);
    return true;
  }
}
