import { type BeforeApplicationShutdown, Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { DATABASE_CONNECTION_STRING } from './database-connection-string.token';

/**
 * Prisma Service
 * Manages Prisma Client lifecycle and database connection
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, BeforeApplicationShutdown {
  constructor(@Inject(DATABASE_CONNECTION_STRING) connectionString: string) {
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async beforeApplicationShutdown(): Promise<void> {
    await this.$disconnect();
  }
}
