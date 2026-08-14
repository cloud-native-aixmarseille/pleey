import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { App } from 'supertest/types';
import { describe, expect, it } from 'vitest';
import { AppModule } from '../src/app/app-module';

const currentDir = dirname(fileURLToPath(import.meta.url));
const backendRootDir = resolve(currentDir, '..');

function ensureE2eTestEnvironment() {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_only_for_tests';
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/pleey_test';
}

describe('AppModule (e2e)', () => {
  async function arrangeApp() {
    ensureE2eTestEnvironment();
    const originalCwd = process.cwd();

    process.chdir(backendRootDir);

    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      const app = moduleFixture.createNestApplication();
      await app.init();

      return {
        app,
        restoreCwd: () => {
          process.chdir(originalCwd);
        },
      };
    } catch (error) {
      process.chdir(originalCwd);
      throw error;
    }
  }

  it('should be defined', async () => {
    // Arrange + Act
    const { app, restoreCwd }: { app: INestApplication<App>; restoreCwd: () => void } = await arrangeApp();

    // Assert
    try {
      expect(app).toBeDefined();
    } finally {
      await app.close();
      restoreCwd();
    }
  });
});
