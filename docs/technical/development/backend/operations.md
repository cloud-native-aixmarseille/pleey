# Backend Operations and Recovery Delivery

## Runtime Configuration

Runtime configuration has no fallback values and does not select behavior from `NODE_ENV`; see the [configuration decision in ADR 0009](../../architecture/adr/0009-harden-identity-recovery-and-sessions.md#explicit-runtime-configuration). Missing required settings fail startup. Supply values through [Compose](../../../../compose.yaml), the [backend chart](../../../../charts/application/charts/backend/README.md), or an explicitly loaded environment based on [`.env.example`](../../../../application/backend/.env.example). Updating an existing deployment requires supplying the settings that previously relied on application defaults.

Required settings cover the application version and environment name, server port and CORS origins, both JWT signing secrets and lifetimes, database and Valkey URLs, CAPTCHA signing secret, recovery settings below, `PARTY_SESSION_RECOVERY_WINDOW_MS`, and `PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES`. Set `TRUSTED_PROXY_CIDRS` explicitly, using an empty value when there are no trusted proxies.

Set each behavior flag to `true` or `false`: `GRAPHQL_GRAPHIQL_ENABLED`, `GRAPHQL_INTROSPECTION_ENABLED`, `I18N_WATCH_ENABLED`, `OTEL_CONSOLE_DIAGNOSTICS_ENABLED`, `OTEL_CONSOLE_EXPORTERS_ENABLED`, and `OTEL_CONSOLE_LOGS_ENABLED`. The optional `GRAPHQL_SCHEMA_OUTPUT_PATH` enables writing the generated schema to a file; omitting it keeps the schema in memory. Translation assets resolve relative to the application module in source and compiled builds.

`API_BASE_URL`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`, and paired SMTP credentials are genuinely optional. Secrets support the existing `NAME_FILE` convention. `JWT_REFRESH_SECRET` must be supplied explicitly; the chart explicitly mounts its JWT key for both signing settings to preserve existing installations.

## Identity Recovery and Deployment

The identity and session model, auditing, revocation, and recovery-delivery design are specified in [ADR 0009](../../architecture/adr/0009-harden-identity-recovery-and-sessions.md).

### Production Recovery Configuration

Recovery requires the following values in every environment:

- `FRONTEND_URL`: the trusted frontend origin. Set `FRONTEND_REQUIRE_HTTPS=true` for public deployments to reject HTTP links. Reset links never derive their origin from request headers.
- `SMTP_HOST`, `SMTP_PORT`, and `SMTP_FROM`: the delivery server, explicit port, and sender.
- `SMTP_SECURE` selects implicit TLS, usually on port `465`; `SMTP_REQUIRE_TLS` requires STARTTLS when implicit TLS is disabled. Both flags are explicit. Public deployments must enable encryption.
- `SMTP_USER` and `SMTP_PASSWORD` together when authentication is required. `SMTP_PASSWORD_FILE` is also supported through the existing environment reader.
- `PASSWORD_RESET_TOKEN_LIFETIME_MINUTES`: a required positive integer. Compose and Helm supply `30`.

Configure recovery through the [backend chart](../../../../charts/application/charts/backend/README.md) under `backend.passwordRecovery`. The chart enables `passwordRecovery.requireHttps` and external SMTP `passwordRecovery.smtp.requireTls`; its bundled relay always requires STARTTLS. [ADR 0009](../../architecture/adr/0009-harden-identity-recovery-and-sessions.md) also specifies the bundled relay and external SMTP opt-out.

### Bundled SMTP Relay

The chart enables the upstream Postfix relay under `backend.smtp` by default. It provides a ClusterIP submission service, STARTTLS, and a persistent outgoing queue. Configure the public origin, sender mailbox, and permitted sender domains:

```yaml
backend:
  passwordRecovery:
    frontendUrl: https://play.example.com
    smtp:
      from: Pleey <noreply@example.com>
  smtp:
    config:
      general:
        ALLOWED_SENDER_DOMAINS: example.com
```

The backend automatically uses this service on port `587` with STARTTLS and trusts its chart-managed CA through `NODE_EXTRA_CA_CERTS`. A NetworkPolicy restricts SMTP ingress to backend pods in the release. The relay keeps its queue on a `1Gi` persistent volume by default; configure `backend.smtp.persistence` for your storage class and capacity. Postfix requires a root master process and runs workers with separate privileges, so namespaces that enforce non-root containers need an external SMTP service instead.

Without an upstream relay, Postfix attempts direct delivery to recipients' mail servers. This requires outbound port `25`, an appropriate public sending IP, and sender DNS such as SPF, DKIM, and reverse DNS. Installing the chart does not provision these prerequisites or guarantee mailbox acceptance. Consult the [upstream delivery guidance](https://github.com/bokysan/docker-postfix/tree/v5.1.0#sending-messages-directly).

To send through an existing provider while retaining the local queue, add its relay settings. Keep the provider's `RELAYHOST_USERNAME` and `RELAYHOST_PASSWORD` in an existing Secret in the release namespace:

```yaml
backend:
  smtp:
    existingSecret: pleey-upstream-smtp-credentials
    config:
      general:
        ALLOWED_SENDER_DOMAINS: example.com
        RELAYHOST: "[smtp.provider.example]:587"
      postfix:
        smtp_tls_security_level: verify
```

The upstream chart exposes that Secret to Postfix as environment variables. Omit `existingSecret` when the provider authorizes delivery without credentials. These are relay-to-provider credentials; `passwordRecovery.smtp.existingSecret` belongs to the external SMTP mode below. See the [upstream configuration reference](https://github.com/bokysan/docker-postfix/tree/v5.1.0#configuration-options) for additional delivery and DKIM settings.

### SMTP Certificates and Rotation

The chart creates a CA and server certificate in `<smtp-service-name>-tls`, reusing that Secret across upgrades. Its default certificate lifetime is `365` days, configurable with `backend.smtp.tls.validityDays` when generating a new Secret. Helm does not renew existing certificates automatically. Monitor expiry and renew before the certificate expires.

For operator-managed certificates, set `backend.smtp.tls.existingSecret` to a Secret in the release namespace containing `tls.crt`, `tls.key`, and `ca.crt`. The server certificate must cover the SMTP Service DNS name used by the backend, and `ca.crt` must contain the issuing CA chain. Only the CA certificate is mounted into the backend. Keep the upstream `certs` settings at their chart-managed defaults.

To renew a generated certificate, delete only the generated TLS Secret and upgrade the release with its existing values so Helm creates a replacement. Restart both the backend Deployment and SMTP StatefulSet after renewal. For an operator-managed Secret, update its contents and restart both workloads. Node reads additional trusted CAs at process startup. Restart the SMTP StatefulSet after rotating upstream credentials, and the backend Deployment after rotating external SMTP credentials.

### External SMTP Service

Disable the bundled relay with `backend.smtp.enabled: false` and configure the external server under `backend.passwordRecovery.smtp`. Keep any SMTP credentials in an existing Kubernetes Secret in the release namespace:

```yaml
backend:
  smtp:
    enabled: false
  passwordRecovery:
    frontendUrl: https://play.example.com
    tokenLifetimeMinutes: 30
    smtp:
      host: smtp.example.com
      port: 587
      secure: false
      requireTls: true
      from: Pleey <noreply@example.com>
      existingSecret:
        name: pleey-smtp-credentials
        userKey: SMTP_USER
        passwordKey: SMTP_PASSWORD
```

The chart mounts the two Secret keys as files and provides their paths through `SMTP_USER_FILE` and `SMTP_PASSWORD_FILE`. Omit the Secret name only when the SMTP server allows unauthenticated delivery. Keep TLS enabled for public deployments: the example explicitly requires STARTTLS; use `secure: true` with the appropriate port for implicit TLS.

Changing chart recovery configuration restarts backend pods through the ConfigMap checksum. Recovery delivery runs inside the backend; no additional application worker Deployment is needed.

Session IP addresses and CAPTCHA request limits use Express's resolved client address. Configure trusted ingress addresses as described below when running behind a proxy.

### Development Mail Capture

Docker Compose sends mail to `mailpit:1025` over `pleey-network`. `make setup` starts Mailpit and Traefik; read captured mail at `http://mailpit.pleey.localhost`. Mailpit captures messages without delivering them externally. Its web UI uses the existing Traefik HTTP entrypoint, and neither Mailpit port is published on the host. The UI inherits Traefik's network exposure and is not restricted to loopback by its hostname.

For a backend running directly on the host, use a separately reachable SMTP service or explicitly publish Mailpit SMTP with `127.0.0.1:1025:1025` in a local Compose override. The host-only settings are illustrated in `application/backend/.env.example`.

The chart's [development values](../../../../charts/application/values-dev.yaml) disable the bundled relay and use HTTP and an unauthenticated Mailpit service on port `1025`. Deploy Mailpit separately in the release namespace or override its host with a server reachable from the backend pod; the chart does not install Mailpit. The [CI values](../../../../charts/application/ci/recovery-values.yaml) keep the bundled relay enabled with a test-only sender domain. Chart smoke tests check application health and do not send recovery email.

## Signup and Recovery CAPTCHA

[ADR 0009](../../architecture/adr/0009-harden-identity-recovery-and-sessions.md) selects embedded Cap with local assets and no browser instrumentation. Both `register` and `forgotPassword` require a `captchaToken`; the signed-in security page also uses the protected recovery action.

Configure `CAP_SECRET` (at least 32 random bytes) or `CAP_SECRET_FILE`, consistently across backend replicas. `VALKEY_URL` or `VALKEY_URL_FILE` supplies the shared Redis-compatible store and is required in every environment. Valkey holds expiring challenge nonces, hashed verification token keys, and pseudonymized request counters. Unavailable storage rejects CAPTCHA operations; it never bypasses verification.

The backend chart generates a 64-character signing secret and preserves it during connected Helm upgrades. For operator-managed secrets or deterministic GitOps rendering, configure an existing Secret:

```yaml
backend:
  captcha:
    existingSecret:
      name: pleey-captcha
      key: CAP_SECRET
```

The chart mounts this as `CAP_SECRET_FILE`. Restart all backend replicas after rotating the signing key. Rotation invalidates outstanding challenges; short-lived issued verification tokens expire independently in Valkey. Compose supplies an explicitly development-only default key. Direct backend deployments require an explicitly configured signing key.

### Endpoints and Limits

The widget uses `POST /api/identity/captcha/{action}/challenge` and `POST /api/identity/captcha/{action}/redeem`, where `action` is `signup` or `password-recovery`. Challenges expire after two minutes. Redeemed verification tokens expire after five minutes and can be consumed only once for the matching action. An invalid or failed form submission needs a fresh verification.

Per action and client address, the backend permits 30 challenge requests per minute, 30 redemption requests per minute, and 10 protected submissions per ten minutes. The existing recovery delivery cooldown remains in force. Ingress limits should additionally cover request volume and body size before requests reach the application.

### Trusted Ingress Addresses

`TRUSTED_PROXY_CIDRS` is required and accepts a comma-separated list of trusted proxy IP addresses or CIDR ranges. The chart exposes it as `backend.config.trustedProxyCidrs`. Set it explicitly to an empty value for direct access. When behind ingress, set only the actual ingress addresses or controlled network ranges; the ingress must sanitize forwarded headers. The backend rejects universal CIDR ranges and blanket trust values.

With an explicitly empty trusted-proxy list, forwarded headers are ignored and clients behind the same proxy share its request limits. This prevents arbitrary client headers from selecting the rate-limit identity. The setting also affects session IP display and Express's forwarded protocol/hostname resolution.


## Quiz Media Storage, Processing, and Delivery

[ADR 0012](../../architecture/adr/0012-support-media-on-quiz-questions.md) defines the accepted formats, transformation budgets, publication semantics, and retention windows. Quiz assets use an existing private S3-compatible bucket and signed delivery URLs; avatars retain their existing storage.

Required media settings are `MEDIA_STORAGE_ENDPOINT`, `MEDIA_STORAGE_REGION`, `MEDIA_STORAGE_BUCKET`, `MEDIA_STORAGE_ACCESS_KEY_ID`, `MEDIA_STORAGE_SECRET_ACCESS_KEY`, `MEDIA_STORAGE_FORCE_PATH_STYLE`, `MEDIA_PUBLIC_BASE_URL`, `MEDIA_REQUIRE_HTTPS`, `MEDIA_ACCESS_TTL_SECONDS`, `MEDIA_PROCESSING_TIMEOUT_MS`, `MEDIA_PROCESSING_CONCURRENCY`, and `MEDIA_PROCESSING_MEMORY_LIMIT_MB`. Both credentials support the `_FILE` convention. The browser-visible delivery base URL may include a path; immutable keys are appended beneath it. Neither URL accepts embedded credentials, query parameters, or fragments. Set `MEDIA_REQUIRE_HTTPS=true` in public deployments to require HTTPS for both the storage API and delivery URL.

Read grants expire after the explicitly configured `MEDIA_ACCESS_TTL_SECONDS` (60–900 seconds; deployment default 300). Issuance requires an authorized editor, the actual party host, or a joined participant with a valid same-party socket session. Clients renew grants while their session and access remain valid. Leaving, kicking, ending a party, or losing permissions prevents renewal; previously issued bearer URLs remain usable until expiry. Treat their query strings as credentials and redact them from ingress, CDN, and tracing logs.

Processing runs synchronously with a per-process concurrency limit (1–8), a deadline (1,000–300,000 milliseconds), and a per-worker memory ceiling (256–4,096 MiB). Deployment examples explicitly use one worker, 120 seconds, and 1,024 MiB. Increase container memory to cover the Node application plus all concurrent processing workers; increasing concurrency without adjusting resources may cause the container to be terminated. The backend image includes FFmpeg, FFprobe, and `prlimit` from Debian's `ffmpeg` and `util-linux` packages. Host workflows require those commands on `PATH`, Linux resource-limit support, and a writable temporary directory. Sharp is installed with backend dependencies. Do not run the media processor against untrusted uploads without the worker resource limits.

### Development Media Services

Compose starts SeaweedFS with a persistent `media-data` volume, authenticated S3 reads and writes, and development-only credentials in `docker/media/s3.json`. Its S3 API is available on the private Compose network at `http://media-storage:8333` and on host loopback at `http://localhost:8333`. The `pleey-media` bucket is created at startup. Use the [example environment](../../../../application/backend/.env.example) for a backend started on the host.

The separate `media-delivery` proxy exposes `http://media.pleey.localhost/pleey-media/quiz/…` through Traefik. It preserves the signed browser-visible Host, escaped path, and complete query string so SeaweedFS validates every read. Response caching is disabled and every response uses `Cache-Control: private, no-store`. Unsigned, expired, and tampered URLs fail at the private origin. The proxy permits GET, HEAD, and OPTIONS, exposes browser CORS headers, and forwards byte ranges. Grants sign GET: use GET with a Range header to inspect or seek media; replaying a GET grant as HEAD fails signature verification. OPTIONS carries no media bytes and remains available for CORS. Bucket listing and public writes are unavailable.

After `docker compose up -d media-storage media-delivery`, run `node docker/media/verify-signed-delivery.cjs` from the repository root to check private origin access, signed GETs/ranges, expiry, tampering, HEAD replay, no-store headers, and CORS. This development-only check needs backend dependencies and access to the Compose container network; it uploads and removes one random probe object.

### Production Media Configuration

Provision a private bucket and a signed-read delivery route before deploying. Disable anonymous reads, public ACLs, and public bucket policies. Grant the backend credential only the object read/write/delete permissions needed for the `quiz/` prefix. `MEDIA_PUBLIC_BASE_URL` selects the exact browser-visible URL to sign with S3 Signature V4, not an unsigned public URL. Its host, escaped path, and full query must arrive unchanged at an origin that accepts that signed host and resolves that bucket path. For AWS S3, configure a direct HTTPS S3 bucket URL as the delivery base, or a proxy that preserves a host accepted by S3; do not rewrite a signature between an arbitrary CDN hostname and an S3 hostname. A custom S3-compatible gateway may accept the external hostname, as the development setup does.

Disable response caching on the entire media route, including existing cached objects and errors. Every read and range request must reach origin signature validation; `private, no-store` alone does not secure a CDN configured to ignore that header. Do not configure a CDN to replace viewer authorization with its own unrestricted origin credentials. This provider-neutral adapter does not implement CloudFront signed URLs or cookies. Cached delivery requires a separate CDN-native signer and viewer authorization before every cache hit, as described in ADR 0012.

Configure CORS for browser GET requests, allow the `Range` header, and expose `Content-Length`, `Content-Range`, `Accept-Ranges`, and `ETag`. Preserve object `Content-Type`, enforce `Cache-Control: private, no-store`, and forward `Range`/`If-Range` requests and `206 Partial Content` responses for seeking. Redact signature query strings from access logs. Verify valid GETs and byte ranges succeed while unsigned, expired, tampered, and HEAD replays of GET grants fail.
The Helm chart supplies runtime settings and mounts credentials from an existing Secret. It does not install object storage or provision a CDN:

```yaml
backend:
  media:
    endpoint: https://s3.example.com
    region: eu-west-1
    bucket: pleey-media
    publicBaseUrl: https://pleey-media.s3.eu-west-1.amazonaws.com
    accessTtlSeconds: 300
    requireHttps: true
    forcePathStyle: false
    existingSecret:
      name: pleey-media
      accessKeyIdKey: MEDIA_STORAGE_ACCESS_KEY_ID
      secretAccessKeyKey: MEDIA_STORAGE_SECRET_ACCESS_KEY
    processing:
      timeoutMs: 120000
      concurrency: 1
      memoryLimitMb: 1024
```

Restart backend replicas after rotating credential Secret contents. Configuration changes restart pods through the existing ConfigMap checksum. The chart defaults reserve 2 GiB of memory for one processing worker plus the application; tune CPU, memory, concurrency, and deadlines together. Its writable `/tmp` volume holds private transient files. Chart CI values use explicit dummy credentials and endpoints because health checks do not upload media. Development chart values require separately deployed storage/delivery services and a `pleey-media` Secret.

### Failure Recovery and Existing Quiz Uploads

Uploads are published only after validation and optimization. A failed replacement leaves the question's previous media reference intact. The durable database asset ledger records pending and retired objects; the cleanup worker scans every minute, expires unattached pending uploads after one hour, and removes retired assets after the 24-hour retirement grace period. Failed deletions remain eligible for retry, including after a restart. Restore storage connectivity or credentials before retrying failed saves; inspect backend errors and the asset ledger when cleanup remains overdue. Keep the ledger when restoring database backups and reconcile storage contents with it before deleting objects manually. Downloaded bytes cannot be recalled, and outstanding grants remain usable until expiry.

For deployments that previously served public object URLs, follow the [private media transition runbook](../../runbooks/private-quiz-media-delivery.md) before reopening traffic. For deployments containing quiz uploads from the earlier PR implementation, follow the [quiz media conversion runbook](../../runbooks/quiz-media-conversion.md).
