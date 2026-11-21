import 'reflect-metadata';
import { type DynamicModule, Global, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter, requestLogger, securityHeaders } from './common/http';
import { JsonLogger, LOGGER } from './common/logger';
import { RateLimitService } from './common/rate-limit';
import { APP_CONFIG, type AppConfig } from './config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.service';
import { SyncModule } from './sync/sync.module';

@Global()
@Module({})
class CoreModule {
  static forRoot(config: AppConfig, logger: JsonLogger): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        { provide: APP_CONFIG, useValue: config },
        { provide: LOGGER, useValue: logger },
        RateLimitService,
      ],
      exports: [APP_CONFIG, LOGGER, RateLimitService],
    };
  }
}

@Module({})
export class AppModule {
  static forRoot(config: AppConfig, logger: JsonLogger): DynamicModule {
    return {
      module: AppModule,
      imports: [
        CoreModule.forRoot(config, logger),
        PrismaModule,
        HealthModule,
        AuthModule,
        SyncModule,
      ],
    };
  }
}

/** Build a fully configured (not yet listening) application. Shared by main.ts and tests. */
export async function createApp(config: AppConfig): Promise<NestExpressApplication> {
  const logger = new JsonLogger(config.LOG_LEVEL);
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot(config, logger), {
    logger,
    bodyParser: false,
  });
  app.set('trust proxy', config.TRUST_PROXY);
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(requestLogger(logger));
  app.use(app.get(RateLimitService).globalMiddleware());
  app.useBodyParser('json', { limit: '1mb', strict: true });
  app.enableCors({
    origin: (origin, cb) => cb(null, !origin || config.CORS_ORIGINS.includes(origin)),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['Retry-After', 'X-Request-Id'],
    credentials: false,
    maxAge: 600,
  });
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.enableShutdownHooks();
  return app;
}
