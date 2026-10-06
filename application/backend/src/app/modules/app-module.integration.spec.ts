import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { Test } from '@nestjs/testing';
import { I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { firstValueFrom, isObservable, skip, timeout } from 'rxjs';
import { describe, expect, it } from 'vitest';

function ensureModuleTestEnvironment() {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_only_for_tests';
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/pleey_test';
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
    requiresRootI18n: true,
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
  it(
    `compiles '${appModuleCase.moduleName}' without unresolved providers`,
    async () => {
      // Arrange
      ensureModuleTestEnvironment();
      const moduleType = await appModuleCase.loadModule();

      // Act
      const testingModule = await Test.createTestingModule({
        imports: [moduleType as never],
      }).compile();

      // Assert
      try {
        expect(testingModule).toBeDefined();
        expect(testingModule.select(moduleType as never)).toBeDefined();
      } finally {
        await testingModule.close();
      }
    },
    APP_MODULE_COMPILE_TIMEOUT_MS,
  );

  it.each(moduleCases)(
    'compiles $moduleName without unresolved providers',
    async ({ loadModule, moduleName, requiresRootI18n = false }) => {
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
    },
  );
});

describe('Translation loader integration', () => {
  it('loads translations, reloads directory changes, and closes the watcher', async () => {
    // Arrange + Act + Assert - keep watcher and filesystem cleanup unconditional.
    const directory = await mkdtemp(path.join(tmpdir(), 'pleey-i18n-'));
    const translationFile = path.join(directory, 'en', 'messages.json');
    let loader: I18nJsonLoader | undefined;
    try {
      await mkdir(path.join(directory, 'en'));
      await writeFile(translationFile, JSON.stringify({ greeting: 'Initial greeting' }));
      loader = new I18nJsonLoader({ path: directory, watch: true });
      // Subscribe immediately to readiness so the file change cannot race the initial scan.
      const watcher = Reflect.get(loader, 'watcher');
      const ready = once(watcher, 'ready');
      const translations = await loader.load();
      if (!isObservable(translations)) {
        throw new Error('Watch mode must provide translation updates');
      }
      const initial = await firstValueFrom(translations);
      const updated = firstValueFrom(translations.pipe(skip(1), timeout(3000)));
      await ready;

      // Act
      await writeFile(translationFile, JSON.stringify({ greeting: 'Updated greeting' }));
      const reloaded = await updated;
      await loader.onModuleDestroy();

      // Assert
      expect(initial).toEqual({ en: { messages: { greeting: 'Initial greeting' } } });
      expect(reloaded).toEqual({ en: { messages: { greeting: 'Updated greeting' } } });
      expect(watcher.getWatched()).toEqual({});
    } finally {
      await loader?.onModuleDestroy();
      await rm(directory, { recursive: true, force: true });
    }
  });
});
