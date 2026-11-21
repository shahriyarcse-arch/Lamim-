import { randomUUID } from 'node:crypto';
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { JsonLogger } from './logger';

export type AppRequest = Request & { requestId?: string; userId?: string };

/** Security headers (helmet-equivalent for a JSON-only API). */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control', 'no-store');
  res.removeHeader('X-Powered-By');
  next();
}

const REQUEST_ID = /^[A-Za-z0-9_-]{8,64}$/;

/** Correlation id + one structured access-log line per request (no bodies, no query strings). */
export function requestLogger(logger: JsonLogger) {
  return (req: AppRequest, res: Response, next: NextFunction): void => {
    const incoming = req.header('x-request-id');
    req.requestId = incoming && REQUEST_ID.test(incoming) ? incoming : randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    const started = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      logger.event(res.statusCode >= 500 ? 'error' : 'info', 'http.request', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ms: Math.round(ms * 10) / 10,
        userId: req.userId,
      });
    });
    next();
  };
}

/** Uniform JSON errors; internals never leak to the client. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: JsonLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<AppRequest>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const retryAfter = (exception as { retryAfterSec?: unknown }).retryAfterSec;
      if (typeof retryAfter === 'number') res.setHeader('Retry-After', String(retryAfter));
      res
        .status(status)
        .json(typeof body === 'string' ? { statusCode: status, message: body } : body);
      return;
    }
    // body-parser errors (malformed JSON, payload too large) carry an HTTP status.
    const status = (exception as { status?: unknown; type?: unknown })?.status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      const message = status === 413 ? 'Payload too large' : 'Malformed request body';
      res.status(status).json({ statusCode: status, message });
      return;
    }
    const err = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.event('error', 'http.unhandled', {
      requestId: req.requestId,
      path: req.path,
      error: err.name,
      detail: err.message,
      stack: err.stack,
    });
    res
      .status(500)
      .json({ statusCode: 500, message: 'Internal server error', requestId: req.requestId });
  }
}
