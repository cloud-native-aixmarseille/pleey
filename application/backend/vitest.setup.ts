// Ensure tests use a safe environment.
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

// PrismaService reads DATABASE_URL; tests should redirect to a test DB when available.
const devUrl = process.env.DATABASE_URL;
const explicitTestUrl = process.env.DATABASE_URL_TEST;

if (explicitTestUrl && explicitTestUrl.trim().length > 0) {
  process.env.DATABASE_URL = explicitTestUrl;
} else if (devUrl && devUrl.trim().length > 0) {
  process.env.DATABASE_URL = deriveTestDatabaseUrlFromDev(devUrl);
}
