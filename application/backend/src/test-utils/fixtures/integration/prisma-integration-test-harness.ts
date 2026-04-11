import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll } from 'vitest';
import { PrismaService } from '../../../infrastructure/database/prisma-service';

type CleanupStep = (prisma: PrismaService) => Promise<void>;
type ProviderClass<TInstance> = new (...args: never[]) => TInstance;

export class PrismaIntegrationTestHarness<TRepository> {
  private testingModule: TestingModule | null = null;
  private prismaService: PrismaService | null = null;
  private repositoryInstance: TRepository | null = null;
  private readonly cleanupSteps: CleanupStep[] = [];

  constructor(private readonly repositoryType: ProviderClass<TRepository>) {
    beforeAll(async () => {
      const testingModule = await Test.createTestingModule({
        providers: [PrismaService, this.repositoryType],
      }).compile();

      const prismaService = testingModule.get(PrismaService);
      const repositoryInstance = testingModule.get(this.repositoryType);

      this.testingModule = testingModule;
      this.prismaService = prismaService;
      this.repositoryInstance = repositoryInstance;
      await prismaService.onModuleInit();
    });

    afterAll(async () => {
      try {
        if (this.prismaService !== null) {
          for (const cleanupStep of this.cleanupSteps) {
            await cleanupStep(this.prismaService);
          }
        }
      } finally {
        if (this.prismaService !== null) {
          await this.prismaService.onModuleDestroy();
        }

        if (this.testingModule !== null) {
          await this.testingModule.close();
        }
      }
    });
  }

  get prisma(): PrismaService {
    if (this.prismaService === null) {
      throw new Error('Prisma integration harness is not initialized yet.');
    }

    return this.prismaService;
  }

  get repository(): TRepository {
    if (this.repositoryInstance === null) {
      throw new Error('Prisma integration harness repository is not initialized yet.');
    }

    return this.repositoryInstance;
  }

  addCleanupStep(cleanupStep: CleanupStep): void {
    this.cleanupSteps.push(cleanupStep);
  }
}
