import { defineConfig } from '@prisma/config';

function readEnvOrFile(name: string): string {
  const direct = process.env[name];
  if (direct && direct.trim().length > 0) {
    return direct.trim();
  }

  const filePath = process.env[`${name}_FILE`];
  if (filePath && filePath.trim().length > 0) {
    // Lazy import to avoid node:fs being required in all contexts.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readFileSync } = require('node:fs') as typeof import('node:fs');
    return readFileSync(filePath.trim(), 'utf8').trim();
  }

  return '';
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: readEnvOrFile('DATABASE_URL'),
  },
  migrations: {
    seed: 'ts-node --esm --transpile-only prisma/seed.ts',
  },
});
