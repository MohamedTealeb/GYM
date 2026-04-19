import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const adapter = new PrismaPg({ connectionString });
    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async checkConnection() {
    try {
      // Minimal, provider-agnostic roundtrip
      await this.$queryRaw`SELECT 1`;
      return { connected: true, message: 'Database connected successfully' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      return { connected: false, message };
    }
  }
}
