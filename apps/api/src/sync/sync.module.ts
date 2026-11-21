import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Module,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  PullQuerySchema,
  type PullResponse,
  PushRequestSchema,
  type PushResponse,
} from '@lamim/sync-protocol';
import { z } from 'zod';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { AppRequest } from '../common/http';
import { SyncRateLimitGuard } from '../common/rate-limit';
import { ZodPipe } from '../common/zod.pipe';
import { SyncGate } from './sync-gate';
import { SyncService } from './sync.service';

/** Only `cursor` and `limit` are accepted; repeated or unknown query params are rejected. */
const PullQueryStrict = z.strictObject(PullQuerySchema.shape);

@Controller('sync')
@UseGuards(JwtAuthGuard, SyncRateLimitGuard)
export class SyncController {
  constructor(@Inject(SyncService) private readonly sync: SyncService) {}

  @Post('push')
  @HttpCode(200)
  push(
    @Req() req: AppRequest,
    @Body(new ZodPipe(PushRequestSchema)) body: z.infer<typeof PushRequestSchema>,
  ): Promise<PushResponse> {
    return this.sync.push(req.userId as string, body);
  }

  @Get('pull')
  pull(
    @Req() req: AppRequest,
    @Query(new ZodPipe(PullQueryStrict)) query: z.infer<typeof PullQueryStrict>,
  ): Promise<PullResponse> {
    return this.sync.pull(req.userId as string, query.cursor, query.limit);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [SyncController],
  providers: [SyncService, SyncGate],
})
export class SyncModule {}
