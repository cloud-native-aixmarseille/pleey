import * as path from 'node:path';
import { Test } from '@nestjs/testing';
import { I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';

function ensureModuleTestEnvironment() {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_only_for_tests';
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/pleey_test';
}

type ModuleCase = {
  readonly moduleName: string;
  readonly loadModule: () => Promise<unknown>;
  readonly requiresRootI18n?: boolean;
};

const APP_MODULE_COMPILE_TIMEOUT_MS = 60_000;

const appModuleCase: ModuleCase = {
  moduleName: 'AppModule',
  loadModule: async () => {
    const { AppModule } = await import('../app-module.js');
    return AppModule;
  },
};

const moduleCases: ModuleCase[] = [
  {
    moduleName: 'DatabaseModule',
    loadModule: async () => {
      const { DatabaseModule } = await import('./database/database-module.js');
      return DatabaseModule;
    },
  },
  {
    moduleName: 'GameModule',
    requiresRootI18n: true,
    loadModule: async () => {
      const { GameModule } = await import('./game/game-module.js');
      return GameModule;
    },
  },
  {
    moduleName: 'HealthModule',
    loadModule: async () => {
      const { HealthModule } = await import('./health/health-module.js');
      return HealthModule;
    },
  },
  {
    moduleName: 'IdentityModule',
    loadModule: async () => {
      const { IdentityModule } = await import('./identity/identity-module.js');
      return IdentityModule;
    },
  },
  {
    moduleName: 'OrganizationModule',
    requiresRootI18n: true,
    loadModule: async () => {
      const { OrganizationModule } = await import('./organization/organization-module.js');
      return OrganizationModule;
    },
  },
];

function createRootI18nTestModule() {
  return I18nModule.forRoot({
    fallbackLanguage: 'en',
    loader: I18nJsonLoader,
    loaderOptions: {
      path: path.join(process.cwd(), 'src/i18n'),
      watch: false,
    },
  });
}

describe('Nest module integration smoke tests', () => {
  afterEach(() => {
    // Reset any module-level overrides that future tests may rely on.
    vi.restoreAllMocks();
  });

  it(
    `compiles '${appModuleCase.moduleName}' without unresolved providers`,
    async () => {
      ensureModuleTestEnvironment();
      const moduleType = await appModuleCase.loadModule();

      const testingModule = await Test.createTestingModule({
        imports: [moduleType as never],
      }).compile();

      try {
        expect(testingModule).toBeDefined();
        expect(testingModule.select(moduleType as never)).toBeDefined();
      } finally {
        await testingModule.close();
      }
    },
    APP_MODULE_COMPILE_TIMEOUT_MS,
  );

  it.each(moduleCases)('compiles $moduleName without unresolved providers', async ({
    loadModule,
    moduleName,
    requiresRootI18n = false,
  }) => {
    ensureModuleTestEnvironment();
    const moduleType = await loadModule();

    const testingModule = await Test.createTestingModule({
      imports: [...(requiresRootI18n ? [createRootI18nTestModule()] : []), moduleType as never],
    }).compile();

    try {
      expect(testingModule).toBeDefined();
      expect(testingModule.select(moduleType as never)).toBeDefined();
    } finally {
      await testingModule.close();
    }

    expect(moduleName).toBeTruthy();
  });
});
