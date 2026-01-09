// Ensure PrismaService switches to DATABASE_URL_TEST.
process.env.NODE_ENV = 'test';

// AppModule imports AuthModule which requires JWT_SECRET at import-time.
// Provide a deterministic dummy secret for tests if not already set.
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_only_for_tests';

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
