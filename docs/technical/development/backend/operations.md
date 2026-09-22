# Backend Operations and Recovery Delivery

## Identity Recovery and Deployment

The identity and session model, auditing, revocation, and recovery-delivery design are specified in [ADR 0009](../../architecture/adr/0009-harden-identity-recovery-and-sessions.md).

### Production Recovery Configuration

Production recovery configuration uses these environment variables:

- `FRONTEND_URL`: the public frontend origin, using HTTPS. Reset links never derive their origin from request headers.
- `SMTP_HOST` and `SMTP_FROM`: the required delivery server and sender. `SMTP_PORT` defaults to `587`.
- `SMTP_SECURE=true` for implicit TLS, usually on port `465`. Otherwise production requires STARTTLS.
- `SMTP_USER` and `SMTP_PASSWORD` together when authentication is required. `SMTP_PASSWORD_FILE` is also supported through the existing environment reader.
- `PASSWORD_RESET_TOKEN_LIFETIME_MINUTES`: optional positive integer, default `30`.

Configure recovery through the [backend chart](../../../../charts/application/charts/backend/README.md) under `backend.passwordRecovery`. The public frontend URL must use HTTPS in production. [ADR 0009](../../architecture/adr/0009-harden-identity-recovery-and-sessions.md) also specifies the bundled relay and external SMTP opt-out.

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
      from: Pleey <noreply@example.com>
      existingSecret:
        name: pleey-smtp-credentials
        userKey: SMTP_USER
        passwordKey: SMTP_PASSWORD
```

The chart mounts the two Secret keys as files and provides their paths through `SMTP_USER_FILE` and `SMTP_PASSWORD_FILE`. Omit the Secret name only when the SMTP server allows unauthenticated delivery. Production always requires TLS: the example uses STARTTLS; use `secure: true` with the appropriate port for implicit TLS.

Changing chart recovery configuration restarts backend pods through the ConfigMap checksum. Recovery delivery runs inside the backend; no additional application worker Deployment is needed.

Session IP addresses reflect the backend's observed peer. The backend currently has no trusted-proxy setting, so deployments behind ingress may show the proxy address rather than the client's address.

### Development Mail Capture

Docker Compose sends mail to `mailpit:1025` over `pleey-network`. `make setup` starts Mailpit and Traefik; read captured mail at `http://mailpit.pleey.localhost`. Mailpit captures messages without delivering them externally. Its web UI uses the existing Traefik HTTP entrypoint, and neither Mailpit port is published on the host. The UI inherits Traefik's network exposure and is not restricted to loopback by its hostname.

For a backend running directly on the host, use a separately reachable SMTP service or explicitly publish Mailpit SMTP with `127.0.0.1:1025:1025` in a local Compose override. The host-only settings are illustrated in `application/backend/.env.example`.

The chart's [development values](../../../../charts/application/values-dev.yaml) disable the bundled relay and use HTTP and an unauthenticated Mailpit service on port `1025`. Deploy Mailpit separately in the release namespace or override its host with a server reachable from the backend pod; the chart does not install Mailpit. The [CI values](../../../../charts/application/ci/recovery-values.yaml) keep the bundled relay enabled with a test-only sender domain. Chart smoke tests check application health and do not send recovery email.
