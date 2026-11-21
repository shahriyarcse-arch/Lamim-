import type { LoggerService } from '@nestjs/common';

type Level = 'error' | 'warn' | 'info' | 'debug';
const ORDER: Record<Level | 'silent', number> = {
  silent: -1,
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Structured JSON-lines logger. Callers pass only metadata (ids, codes, timings) —
 * never request bodies, tokens, passwords or connection strings.
 */
export class JsonLogger implements LoggerService {
  constructor(private readonly level: Level | 'silent' = 'info') {}

  private write(
    level: Level,
    message: unknown,
    context?: unknown,
    extra?: Record<string, unknown>,
  ): void {
    if (ORDER[level] > ORDER[this.level]) return;
    const entry: Record<string, unknown> = { level, time: new Date().toISOString() };
    if (typeof message === 'object' && message !== null && !(message instanceof Error))
      Object.assign(entry, message);
    else entry.msg = message instanceof Error ? message.message : String(message);
    if (typeof context === 'string') entry.context = context;
    if (extra) Object.assign(entry, extra);
    (level === 'error' || level === 'warn' ? process.stderr : process.stdout).write(
      `${JSON.stringify(entry)}\n`,
    );
  }

  log(message: unknown, context?: unknown): void {
    this.write('info', message, context);
  }
  error(message: unknown, stackOrContext?: unknown, context?: unknown): void {
    const ctx =
      context ??
      (typeof stackOrContext === 'string' && !stackOrContext.includes('\n')
        ? stackOrContext
        : undefined);
    const stack =
      typeof stackOrContext === 'string' && stackOrContext.includes('\n')
        ? stackOrContext
        : undefined;
    this.write('error', message, ctx, stack ? { stack } : undefined);
  }
  warn(message: unknown, context?: unknown): void {
    this.write('warn', message, context);
  }
  debug(message: unknown, context?: unknown): void {
    this.write('debug', message, context);
  }
  verbose(message: unknown, context?: unknown): void {
    this.write('debug', message, context);
  }

  /** Structured event helper: `logger.event('info', 'sync.push', { userId, accepted })`. */
  event(level: Level, msg: string, fields: Record<string, unknown> = {}): void {
    this.write(level, msg, undefined, fields);
  }
}

/** DI token for the shared JsonLogger instance. */
export const LOGGER = Symbol('LOGGER');
