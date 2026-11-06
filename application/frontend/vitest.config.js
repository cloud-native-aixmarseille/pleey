import path from 'node:path';
import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

// Audited DOM-free suites. New and browser-dependent suites keep the jsdom setup.
const nodeTestFiles = [
  'src/application/game/management/use-cases/list-project-games-use-case.spec.ts',
  'src/application/game/party/host/services/host-party-runtime-controls-resolver.spec.ts',
  'src/application/game/party/shared/facades/party-lobby.facade.spec.ts',
  'src/application/game/party/shared/services/identifiers/party-pin-identifier.spec.ts',
  'src/application/game/party/shared/services/party-route.service.spec.ts',
  'src/application/game/types/prediction/facades/prediction-management.facade.spec.ts',
  'src/application/game/types/quiz/facades/quiz-management.facade.spec.ts',
  'src/application/shared/services/collect-paginated-items.spec.ts',
  'src/application/shared/services/identifier-parser/uuid-v7-identifier-parser.spec.ts',
  'src/application/workspace/dashboard/facades/dashboard-home-actions.facade.spec.ts',
  'src/application/workspace/dashboard/facades/dashboard-workspace.facade.spec.ts',
  'src/application/workspace/organizations/use-cases/get-organization-dashboard-use-case.spec.ts',
  'src/application/workspace/shared/services/identifiers/organization-identifier.spec.ts',
  'src/application/workspace/shared/services/identifiers/project-identifier.spec.ts',
  'src/application/workspace/themes/services/theme-identifier.spec.ts',
  'src/domains/game/types/shared/static-game-type-catalog.spec.ts',
  'src/domains/identity/services/auth-payload-inspector.spec.ts',
  'src/domains/shared/errors/domain-error.spec.ts',
  'src/domains/shared/services/action-permission-decoder.spec.ts',
  'src/domains/theme/services/theme-document-normalizer.spec.ts',
  'src/domains/theme/services/theme-palette-generator.spec.ts',
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: nodeTestFiles,
          setupFiles: './test/setup-node.ts',
        },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          exclude: [...configDefaults.exclude, ...nodeTestFiles],
          setupFiles: './test/setup.ts',
        },
      },
    ],
    maxWorkers: 4,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/test-utils/**',
        'src/app/bootstrap/main.tsx',
        'src/app/composition/runtime-container.ts',
        'src/app/routing/app-router.tsx',
      ],
    },
  },
});
