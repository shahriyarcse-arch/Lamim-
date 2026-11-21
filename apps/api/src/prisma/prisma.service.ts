import { Global, Inject, Injectable, Module, type OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { APP_CONFIG, type AppConfig } from '../config';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  /** Fully-qualified, quoted name of the sync revision sequence (raw SQL is not auto-qualified). */
  readonly syncRevSequence: string;
  /** Quoted schema name for hand-written SQL (validated by the config regex). */
  readonly schemaSql: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    const schema = config.DB_SCHEMA;
    super({
      adapter: new PrismaPg(
        {
          connectionString: config.DATABASE_URL,
          max: 10,
          connectionTimeoutMillis: 10_000,
          idleTimeoutMillis: 30_000,
        },
        schema === 'public' ? undefined : { schema },
      ),
    });
    this.syncRevSequence = `"${schema}"."sync_rev"`;
    this.schemaSql = `"${schema}"`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
