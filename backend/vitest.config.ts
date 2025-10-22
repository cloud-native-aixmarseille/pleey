declare function require(moduleName: string): any;
declare const __dirname: string;

const { resolve } = require('path');

const srcRoot = resolve(__dirname, 'src');

export default {
  test: {
    globals: true,
    environment: 'node',
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
      '@': srcRoot,
    },
  },
};
