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
