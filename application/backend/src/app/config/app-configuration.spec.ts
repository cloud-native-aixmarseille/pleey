import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createAppEnvironmentFixture } from '../../test-utils/fixtures/unit/app-environment.fixture';
import { AppConfiguration } from './app-configuration';
import { AppEnvironment } from './app-environment';

const requiredNames = Object.keys(createAppEnvironmentFixture());
const booleanNames = [
  'FRONTEND_REQUIRE_HTTPS',
  'MEDIA_REQUIRE_HTTPS',
  'MEDIA_STORAGE_FORCE_PATH_STYLE',
  'SMTP_SECURE',
  'SMTP_REQUIRE_TLS',
  'GRAPHQL_GRAPHIQL_ENABLED',
  'GRAPHQL_INTROSPECTION_ENABLED',
  'I18N_WATCH_ENABLED',
  'OTEL_CONSOLE_DIAGNOSTICS_ENABLED',
  'OTEL_CONSOLE_EXPORTERS_ENABLED',
  'OTEL_CONSOLE_LOGS_ENABLED',
];
const integerNames = [
  'MEDIA_ACCESS_TTL_SECONDS',
  'MEDIA_PROCESSING_TIMEOUT_MS',
  'MEDIA_PROCESSING_CONCURRENCY',
  'MEDIA_PROCESSING_MEMORY_LIMIT_MB',
  'JWT_ACCESS_EXPIRES_IN_SECONDS',
  'JWT_REFRESH_EXPIRES_IN_SECONDS',
  'SMTP_PORT',
  'PASSWORD_RESET_TOKEN_LIFETIME_MINUTES',
  'PORT',
  'PARTY_SESSION_RECOVERY_WINDOW_MS',
  'PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES',
];

describe('AppConfiguration', () => {
  it.each(['development', 'production', 'test', 'preview'])(
    'uses NODE_ENV=%s only as telemetry metadata',
    (nodeEnvironment) => {
      // Arrange
      const baseline = new AppConfiguration(
        new AppEnvironment(createAppEnvironmentFixture()),
      ).getRuntimeConfiguration();
      const environment = new AppEnvironment(createAppEnvironmentFixture({ NODE_ENV: nodeEnvironment }));
      // Act
      const actual = new AppConfiguration(environment).getRuntimeConfiguration();
      // Assert
      expect(actual).toEqual({ ...baseline, telemetry: { ...baseline.telemetry, environment: nodeEnvironment } });
    },
  );

  it.each(requiredNames)('rejects missing %s instead of selecting a default', (name) => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture({ [name]: undefined }));
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow(`${name} environment variable is not defined`);
  });

  it.each(requiredNames.filter((name) => name !== 'TRUSTED_PROXY_CIDRS'))(
    'rejects empty required setting %s',
    (name) => {
      // Arrange
      const environment = new AppEnvironment(createAppEnvironmentFixture({ [name]: '  ' }));
      // Act + Assert
      expect(() => new AppConfiguration(environment)).toThrow(name);
    },
  );

  it('keeps genuinely optional settings absent', () => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture());
    // Act
    const config = new AppConfiguration(environment).getRuntimeConfiguration();
    // Assert
    expect(config.authPublicApiBaseUrl).toBeUndefined();
    expect(config.server.graphqlSchemaOutputPath).toBeUndefined();
    expect(config.telemetry.endpoint).toBeUndefined();
    expect(config.telemetry.headersJson).toBeUndefined();
    expect(config.passwordRecovery.smtpUser).toBeUndefined();
    expect(config.passwordRecovery.smtpPassword).toBeUndefined();
  });

  it('honors explicit feature settings and distinct refresh credentials in production', () => {
    // Arrange
    const environment = new AppEnvironment(
      createAppEnvironmentFixture({
        NODE_ENV: 'production',
        APP_VERSION: '  1.2.3  ',
        JWT_REFRESH_SECRET: 'explicit-refresh-signing-key',
        GRAPHQL_GRAPHIQL_ENABLED: 'true',
        GRAPHQL_INTROSPECTION_ENABLED: 'true',
        GRAPHQL_SCHEMA_OUTPUT_PATH: '/tmp/pleey-schema.gql',
        I18N_WATCH_ENABLED: 'true',
        OTEL_CONSOLE_DIAGNOSTICS_ENABLED: 'true',
        OTEL_CONSOLE_EXPORTERS_ENABLED: 'true',
        OTEL_CONSOLE_LOGS_ENABLED: 'true',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'https://otel.example',
        OTEL_EXPORTER_OTLP_HEADERS: '{"Authorization":"Bearer test"}',
        API_BASE_URL: 'https://api.example',
      }),
    );
    // Act
    const configuration = new AppConfiguration(environment);
    // Assert
    expect(configuration.getApplicationVersion()).toBe('1.2.3');
    expect(configuration.getRefreshTokenConfig().secret).toBe('explicit-refresh-signing-key');
    expect(configuration.getServerConfig()).toMatchObject({
      graphiqlEnabled: true,
      graphqlIntrospectionEnabled: true,
      graphqlSchemaOutputPath: '/tmp/pleey-schema.gql',
      i18nWatchEnabled: true,
    });
    expect(configuration.getTelemetryConfig()).toEqual({
      consoleDiagnosticsEnabled: true,
      consoleExportersEnabled: true,
      consoleLogsEnabled: true,
      endpoint: 'https://otel.example',
      environment: 'production',
      headersJson: '{"Authorization":"Bearer test"}',
    });
    expect(configuration.getAuthPublicApiBaseUrl()).toBe('https://api.example');
  });

  it.each(booleanNames.flatMap((name) => ['1', 'TRUE', 'sometimes'].map((value) => [name, value])))(
    'rejects invalid boolean %s=%s',
    (name, value) => {
      // Arrange
      const environment = new AppEnvironment(createAppEnvironmentFixture({ [name]: value }));
      // Act + Assert
      expect(() => new AppConfiguration(environment)).toThrow(`${name} must be 'true' or 'false'`);
    },
  );

  it.each(
    integerNames.flatMap((name) => ['0', '-1', '1.5', '1e3', '0x10', '9007199254740992'].map((value) => [name, value])),
  )('rejects invalid integer setting %s=%s', (name, value) => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture({ [name]: value }));
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow(`${name} must be a positive safe integer`);
  });

  it.each(['PORT', 'SMTP_PORT'])('bounds %s to valid network ports', (name) => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture({ [name]: '65536' }));
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow(`${name} must be between 1 and 65535`);
  });

  it('uses explicitly supplied numeric values without replacing them', () => {
    // Arrange
    const environment = new AppEnvironment(
      createAppEnvironmentFixture({
        PORT: '65535',
        SMTP_PORT: '2525',
        JWT_ACCESS_EXPIRES_IN_SECONDS: '1800',
        JWT_REFRESH_EXPIRES_IN_SECONDS: '7200',
        PASSWORD_RESET_TOKEN_LIFETIME_MINUTES: '45',
        PARTY_SESSION_RECOVERY_WINDOW_MS: '60000',
        PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES: '1048576',
      }),
    );
    // Act
    const config = new AppConfiguration(environment).getRuntimeConfiguration();
    // Assert
    expect(config).toMatchObject({
      accessToken: { expiresInSeconds: 1800 },
      refreshToken: { expiresInSeconds: 7200 },
      server: { port: 65535 },
      passwordRecovery: { smtpPort: 2525, resetTokenLifetimeMinutes: 45 },
      partySessionRecoveryWindowMs: 60000,
      playableContentImportMaxFileSizeBytes: 1048576,
    });
  });

  it.each(['development', 'production'])('enforces HTTPS through its explicit flag for %s', (nodeEnvironment) => {
    // Arrange
    const environment = new AppEnvironment(
      createAppEnvironmentFixture({
        NODE_ENV: nodeEnvironment,
        FRONTEND_REQUIRE_HTTPS: 'true',
        FRONTEND_URL: 'http://play.example',
      }),
    );
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow('FRONTEND_REQUIRE_HTTPS');
  });

  it('applies explicit recovery TLS settings independently', () => {
    // Arrange
    const environment = new AppEnvironment(
      createAppEnvironmentFixture({
        NODE_ENV: 'development',
        FRONTEND_REQUIRE_HTTPS: 'true',
        FRONTEND_URL: 'https://play.example/path',
        SMTP_SECURE: 'true',
        SMTP_REQUIRE_TLS: 'true',
        SMTP_USER: 'smtp-user',
        SMTP_PASSWORD: 'smtp-password',
      }),
    );
    // Act
    const recovery = new AppConfiguration(environment).getRuntimeConfiguration().passwordRecovery;
    // Assert
    expect(recovery).toMatchObject({
      frontendUrl: 'https://play.example',
      smtpSecure: true,
      smtpRequireTls: true,
      smtpUser: 'smtp-user',
      smtpPassword: 'smtp-password',
    });
  });

  it.each(['https://user:password@play.example', 'javascript:alert(1)', 'malformed'])(
    'rejects unsafe recovery URL %s',
    (frontendUrl) => {
      // Arrange
      const environment = new AppEnvironment(createAppEnvironmentFixture({ FRONTEND_URL: frontendUrl }));
      // Act + Assert
      expect(() => new AppConfiguration(environment)).toThrow('FRONTEND_URL');
    },
  );

  it.each([{ SMTP_USER: 'user' }, { SMTP_PASSWORD: 'password' }])(
    'rejects incomplete SMTP credentials %#',
    (credentials) => {
      // Arrange
      const environment = new AppEnvironment(createAppEnvironmentFixture(credentials));
      // Act + Assert
      expect(() => new AppConfiguration(environment)).toThrow('SMTP_USER and SMTP_PASSWORD');
    },
  );

  it('trusts no forwarded addresses for an explicitly empty trust list', () => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture({ TRUSTED_PROXY_CIDRS: '' }));
    // Act
    const proxies = new AppConfiguration(environment).getServerConfig().trustedProxyCidrs;
    // Assert
    expect(proxies).toEqual([]);
  });

  it('parses explicitly supplied origins and ingress trust networks', () => {
    // Arrange
    const environment = new AppEnvironment(
      createAppEnvironmentFixture({
        CORS_ORIGIN: ' https://play.example , http://localhost:5173 ',
        TRUSTED_PROXY_CIDRS: '10.42.0.0/16,::1',
      }),
    );
    // Act
    const config = new AppConfiguration(environment);
    // Assert
    expect(config.getGameSocketCorsOptions()).toEqual({
      origin: ['https://play.example', 'http://localhost:5173'],
      credentials: true,
    });
    expect(config.getServerConfig().trustedProxyCidrs).toEqual(['10.42.0.0/16', '::1']);
  });

  it('allows an explicit wildcard without credentials', () => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture({ CORS_ORIGIN: '*' }));
    // Act
    const options = new AppConfiguration(environment).getGameSocketCorsOptions();
    // Assert
    expect(options).toEqual({ origin: '*', credentials: false });
  });

  it.each([',', 'https://play.example,', '*,https://play.example', 'not-an-origin', 'https://play.example/path'])(
    'rejects malformed CORS origin list %s',
    (origins) => {
      // Arrange
      const environment = new AppEnvironment(createAppEnvironmentFixture({ CORS_ORIGIN: origins }));
      // Act + Assert
      expect(() => new AppConfiguration(environment)).toThrow('CORS_ORIGIN');
    },
  );

  it('rejects a weak dedicated CAPTCHA signing secret', () => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture({ CAP_SECRET: 'short' }));
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow('CAP_SECRET');
  });

  it.each(['https://cache.example', 'invalid-url-with-credentials', 'redis:///'])(
    'rejects invalid CAPTCHA storage URL %s',
    (valkeyUrl) => {
      // Arrange
      const environment = new AppEnvironment(createAppEnvironmentFixture({ VALKEY_URL: valkeyUrl }));
      // Act + Assert
      expect(() => new AppConfiguration(environment)).toThrow('VALKEY_URL');
    },
  );

  it('normalizes CDN paths and supplies explicit storage and processing configuration', () => {
    // Arrange
    const environment = new AppEnvironment(
      createAppEnvironmentFixture({
        MEDIA_STORAGE_ENDPOINT: 'https://s3.example/',
        MEDIA_PUBLIC_BASE_URL: 'https://cdn.example/assets/',
        MEDIA_STORAGE_FORCE_PATH_STYLE: 'false',
        MEDIA_REQUIRE_HTTPS: 'true',
        MEDIA_ACCESS_TTL_SECONDS: '600',
        MEDIA_PROCESSING_TIMEOUT_MS: '300000',
        MEDIA_PROCESSING_CONCURRENCY: '2',
        MEDIA_PROCESSING_MEMORY_LIMIT_MB: '2048',
      }),
    );
    // Act
    const config = new AppConfiguration(environment).getRuntimeConfiguration();
    // Assert
    expect(config.mediaStorage).toMatchObject({
      endpoint: 'https://s3.example',
      publicBaseUrl: 'https://cdn.example/assets',
      forcePathStyle: false,
      accessTtlSeconds: 600,
    });
    expect(config.mediaProcessing).toEqual({ timeoutMs: 300000, concurrency: 2, memoryLimitMb: 2048 });
  });

  it.each(
    ['MEDIA_STORAGE_ENDPOINT', 'MEDIA_PUBLIC_BASE_URL'].flatMap((name) =>
      [
        'invalid',
        'file:///tmp/media',
        'https://user:secret@media.example',
        'https://media.example/path?secret=token',
        'https://media.example/path#fragment',
      ].map((value) => [name, value]),
    ),
  )('rejects invalid media URL in %s', (name, value) => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture({ [name]: value }));
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow(name);
  });

  it.each(['MEDIA_STORAGE_ENDPOINT', 'MEDIA_PUBLIC_BASE_URL'])('enforces HTTPS for %s when requested', (name) => {
    // Arrange
    const environment = new AppEnvironment(
      createAppEnvironmentFixture({
        MEDIA_REQUIRE_HTTPS: 'true',
        MEDIA_STORAGE_ENDPOINT: 'https://storage.example',
        MEDIA_PUBLIC_BASE_URL: 'https://cdn.example',
        [name]: 'http://media.example',
      }),
    );
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow(name);
  });

  it.each([
    ['MEDIA_ACCESS_TTL_SECONDS', '59'],
    ['MEDIA_ACCESS_TTL_SECONDS', '901'],
    ['MEDIA_PROCESSING_TIMEOUT_MS', '999'],
    ['MEDIA_PROCESSING_TIMEOUT_MS', '300001'],
    ['MEDIA_PROCESSING_CONCURRENCY', '9'],
    ['MEDIA_PROCESSING_MEMORY_LIMIT_MB', '255'],
    ['MEDIA_PROCESSING_MEMORY_LIMIT_MB', '4097'],
  ])('rejects unbounded media setting %s=%s', (name, value) => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture({ [name]: value }));
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow(`${name} must be between`);
  });

  it.each(['../media', 'a', 'asset..bucket', 'Uppercase', 'media/quiz'])('rejects invalid bucket %s', (bucket) => {
    // Arrange
    const environment = new AppEnvironment(createAppEnvironmentFixture({ MEDIA_STORAGE_BUCKET: bucket }));
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow('MEDIA_STORAGE_BUCKET');
  });

  it('loads required values and optional SMTP credentials from mounted files', () => {
    // Arrange
    const directory = mkdtempSync(join(tmpdir(), 'pleey-config-'));
    const values: NodeJS.ProcessEnv = {
      CAP_SECRET: 'mounted_captcha_secret_at_least_32_bytes',
      VALKEY_URL: 'rediss://cache.example:6379',
      JWT_REFRESH_SECRET: 'mounted-refresh-key',
      SMTP_USER: 'smtp-user',
      SMTP_PASSWORD: 'smtp-password',
      MEDIA_STORAGE_ACCESS_KEY_ID: 'mounted-media-access-key',
      MEDIA_STORAGE_SECRET_ACCESS_KEY: 'mounted-media-secret-key',
      TRUSTED_PROXY_CIDRS: '',
    };
    const overrides: NodeJS.ProcessEnv = {};
    for (const [name, value] of Object.entries(values)) {
      const file = join(directory, name);
      writeFileSync(file, `${value}\n`);
      overrides[name] = undefined;
      overrides[`${name}_FILE`] = file;
    }
    // Act + Assert
    try {
      const config = new AppConfiguration(
        new AppEnvironment(createAppEnvironmentFixture(overrides)),
      ).getRuntimeConfiguration();
      expect(config.captcha).toEqual({ secret: values.CAP_SECRET, valkeyUrl: values.VALKEY_URL });
      expect(config.refreshToken.secret).toBe(values.JWT_REFRESH_SECRET);
      expect(config.passwordRecovery).toMatchObject({ smtpUser: values.SMTP_USER, smtpPassword: values.SMTP_PASSWORD });
      expect(config.server.trustedProxyCidrs).toEqual([]);
      expect(config.mediaStorage).toMatchObject({
        accessKeyId: values.MEDIA_STORAGE_ACCESS_KEY_ID,
        secretAccessKey: values.MEDIA_STORAGE_SECRET_ACCESS_KEY,
      });
    } finally {
      rmSync(directory, { recursive: true });
    }
  });
});
