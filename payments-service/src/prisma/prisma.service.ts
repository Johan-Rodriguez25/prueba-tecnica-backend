import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }

    const poolMax = Number(process.env.DATABASE_POOL_MAX ?? 20);
    const idleTimeoutMillis = Number(
      process.env.DATABASE_POOL_IDLE_TIMEOUT_MS ?? 30_000,
    );
    const connectionTimeoutMillis = Number(
      process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS ?? 10_000,
    );

    const pool = new Pool({
      connectionString,
      max: Number.isFinite(poolMax) ? poolMax : 10,
      idleTimeoutMillis: Number.isFinite(idleTimeoutMillis)
        ? idleTimeoutMillis
        : 30_000,
      connectionTimeoutMillis: Number.isFinite(connectionTimeoutMillis)
        ? connectionTimeoutMillis
        : 10_000,
    });

    const adapter = new PrismaPg(pool);

    const transactionMaxWait = Number(
      process.env.PRISMA_TX_MAX_WAIT_MS ?? 20_000,
    );
    const transactionTimeout = Number(
      process.env.PRISMA_TX_TIMEOUT_MS ?? 120_000,
    );

    super({
      adapter,
      transactionOptions: {
        maxWait: Number.isFinite(transactionMaxWait)
          ? transactionMaxWait
          : 20_000,
        timeout: Number.isFinite(transactionTimeout)
          ? transactionTimeout
          : 120_000,
      },
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
