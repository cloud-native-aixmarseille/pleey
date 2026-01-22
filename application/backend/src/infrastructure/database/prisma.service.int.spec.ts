import { Test, type TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { PrismaService } from './prisma.service';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe : describe.skip;

describeIfDatabase('PrismaService (integration)', () => {
  it('connects and can run a simple query', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();
    const prisma = module.get(PrismaService);

    try {
      await prisma.onModuleInit();
      await expect(prisma.$queryRaw(Prisma.sql`SELECT 1 as ok`)).resolves.toBeDefined();
    } finally {
      await prisma.onModuleDestroy();
      await module.close();
    }
  });
});
