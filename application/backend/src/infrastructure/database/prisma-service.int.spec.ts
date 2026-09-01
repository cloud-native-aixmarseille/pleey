import { Test, type TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { DatabaseModule } from '../../app/modules/database/database-module';
import { PrismaService } from './prisma-service';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe : describe.skip;

describeIfDatabase('PrismaService', () => {
  it('connects and can run a simple query', async () => {
    // Arrange
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
    await module.init();

    const prisma = module.get(PrismaService);

    // Act + Assert
    try {
      await expect(prisma.$queryRaw(Prisma.sql`SELECT 1 as ok`)).resolves.toBeDefined();
    } finally {
      await module.close();
    }
  });
});
