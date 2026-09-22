import { createAppEnvironmentFixture } from '../src/test-utils/fixtures/unit/app-environment.fixture';

// Test tooling supplies explicit runtime values; real database availability remains opt-in.
process.env.NODE_ENV = 'test';
for (const [name, value] of Object.entries(createAppEnvironmentFixture())) {
  if (name !== 'DATABASE_URL' && process.env[name] === undefined && process.env[`${name}_FILE`] === undefined) {
    process.env[name] = value;
  }
}

function deriveTestDatabaseUrlFromDev(devUrl: string): string {
  const url = new URL(devUrl);
  const dbName = url.pathname.replace(/^\//, '');
  const testDbName = dbName.endsWith('_test') ? dbName : `${dbName}_test`;
  url.pathname = `/${testDbName}`;
  return url.toString();
}

// PrismaService must remain agnostic: it always reads DATABASE_URL.
// The test engine is responsible for overriding DATABASE_URL to point to a test DB.
const devUrl = process.env.DATABASE_URL;
const explicitTestUrl = process.env.DATABASE_URL_TEST;

if (explicitTestUrl && explicitTestUrl.trim().length > 0) {
  process.env.DATABASE_URL = explicitTestUrl;
} else if (devUrl && devUrl.trim().length > 0) {
  process.env.DATABASE_URL = deriveTestDatabaseUrlFromDev(devUrl);
}

if (devUrl && process.env.DATABASE_URL && devUrl.trim() === process.env.DATABASE_URL.trim()) {
  throw new Error('E2E tests must not use the dev DATABASE_URL');
}
