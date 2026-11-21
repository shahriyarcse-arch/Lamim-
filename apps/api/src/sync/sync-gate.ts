import { Inject, Injectable } from '@nestjs/common';
import { TooManyRequestsException } from '../common/rate-limit';
import { APP_CONFIG, type AppConfig } from '../config';

interface UserLane {
  inFlight: number;
  tail: Promise<void>;
}

/**
 * Per-user, in-process sync lane: a user's push/pull requests run one at a time (FIFO) and at
 * most `maxInFlight` may be running or queued; extra requests get 429 immediately. Requests
 * wait here — holding no database connection — instead of inside an open transaction, so one
 * user can never occupy more than one pooled connection. Cross-instance exclusion is handled by
 * pg_try_advisory_xact_lock in the push transaction.
 */
@Injectable()
export class SyncGate {
  private readonly lanes = new Map<string, UserLane>();
  private readonly maxInFlight: number;

  constructor(@Inject(APP_CONFIG) config: Pick<AppConfig, 'SYNC_MAX_IN_FLIGHT_PER_USER'>) {
    this.maxInFlight = config.SYNC_MAX_IN_FLIGHT_PER_USER;
  }

  async run<T>(userId: string, fn: () => Promise<T>): Promise<T> {
    let lane = this.lanes.get(userId);
    if (!lane) {
      lane = { inFlight: 0, tail: Promise.resolve() };
      this.lanes.set(userId, lane);
    }
    if (lane.inFlight >= this.maxInFlight) {
      throw new TooManyRequestsException(1, 'Too many concurrent sync requests');
    }
    lane.inFlight++;
    const previous = lane.tail;
    let release!: () => void;
    lane.tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    try {
      await previous;
      return await fn();
    } finally {
      release();
      lane.inFlight--;
      if (lane.inFlight === 0) this.lanes.delete(userId);
    }
  }

  /** Number of users with requests running or queued (for tests / metrics). */
  get activeUsers(): number {
    return this.lanes.size;
  }
}
