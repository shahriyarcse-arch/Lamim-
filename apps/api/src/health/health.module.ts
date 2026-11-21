import { Controller, Get, Module } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /** Liveness only: touches no database and no secrets. */
  @Get()
  get(): { status: 'ok' } {
    return { status: 'ok' };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
