import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

const config = {
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [resolve(currentDir, './vitest.setup.ts')],
    include: ['**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'test'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', '**/*.spec.ts', '**/*.interface.ts', '**/dto/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(currentDir, 'src'),
    },
  },
};

export default config;
