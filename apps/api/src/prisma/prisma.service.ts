import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[Prisma] Connected to database');
    } catch (err) {
      console.error('[Prisma] Failed to connect on startup (will retry on first query):', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
