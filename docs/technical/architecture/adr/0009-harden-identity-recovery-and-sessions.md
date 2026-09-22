# ADR 0009: Redesign account identity, recovery, sessions, and delivery

- Status: Proposed
- Proposed date: 2026-09-09
- Accepted date: N/A

## Context

[Issue #478](https://github.com/cloud-native-aixmarseille/pleey/issues/478) requires working password recovery, a private account workspace, account history, and consistent session recovery, auditing, and revocation. The existing account surface mixes public authentication and private account tasks, stores only one refresh token on the user row, leaves access tokens valid after logout, truncates refresh-token input through bcrypt, and trusts persisted browser profiles without server validation.

The same initiative also needs a production-ready recovery delivery path. External SMTP-only configuration leaves every installation to provision its own relay, while development-oriented capture tools do not satisfy real password recovery delivery.

Public signup and password recovery also need protection against automated account creation and recovery email abuse. CAPTCHA selection prioritizes open source, privacy awareness, current maintenance, and adoption. The existing `register` and `forgotPassword` mutations must retain generic recovery responses and the database-backed per-account delivery cooldown. This protection covers signup and recovery-email requests, including the signed-in recovery action; the subsequent token-bearing password replacement form does not require an additional CAPTCHA.

## Decision Drivers

- Recovery must not disclose account existence or store recoverable reset tokens.
- Logout, remote revocation, and password changes must revoke authenticated access across API and realtime boundaries.
- Let users inspect and terminate individual account sessions without affecting guest identity.
- Give account tasks stable, shareable locations with responsive navigation and localized feedback.
- Send recovery messages to their recipients and retain queued mail across restarts.
- Preserve production TLS and certificate verification for recovery delivery.
- Retain external SMTP configuration when the bundled relay is disabled.
- Keep application policy behind ports and infrastructure in adapters.
- Prefer an auditable, self-hosted widget and verifier without a mandatory vendor service.
- Minimize visitor data collection and third-party requests.
- Verify maintenance and distinguish public interest from measured deployments.
- Fit the existing [application stack and boundaries](../index.md).
- Keep mobile, keyboard, screen-reader, English, and French experiences usable.
- Enforce protection on the server, including direct API requests and replay attempts.

## Considered Options

### Option 1: Incrementally patch the current account flow

Keep the mixed public/private profile surface and single-session storage, then add recovery and history with minimal structural change.

### Option 2: Rebuild account identity around dedicated authentication, workspace, and session models

Separate profile data from authentication state, introduce independent persisted account sessions, and redesign the account surface around dedicated profile, security, and history routes.

### Option 3: Replace authentication with an external identity provider

Delegate passwords, recovery, and sessions to a provider. This requires a separate migration of accounts, deployment configuration, and all transports.

### Recovery delivery options within this initiative

#### Option A: Bundle Mailpit

Mailpit fits local development but captures mail by default and requires another server for real delivery.

#### Option B: Bundle the upstream Postfix relay chart

The maintained bokysan/mail chart supplies SMTP submission, a persistent queue, and direct or upstream delivery.

#### Option C: Require external SMTP

Keep the existing configuration, leaving every installation to provision its own service.

### Signup and recovery CAPTCHA options within this initiative

Research snapshot: 2026-09-27. GitHub stars indicate community interest, not installations or security effectiveness. Provider customer claims are not independently verified here.

#### CAPTCHA option A: ALTCHA open-source core

The [MIT-licensed widget](https://github.com/altcha-org/altcha) and [JavaScript challenge library](https://github.com/altcha-org/altcha-lib) support proof-of-work verification on our infrastructure. React examples and TypeScript support fit Pleey. The widget repository has approximately 2.8k stars; [v3.2.3 was released on September 20](https://github.com/altcha-org/altcha/releases/tag/v3.2.3).

This option would use the open-source core; Cloud and Sentinel add separate commercial capabilities. We would own rate limiting, replay protection, and operational monitoring.

Privacy requires explicit configuration: the current widget enables a [Human Interaction Signature collector](https://altcha.org/docs/sentinel/features/human-interaction-signature/) by default. A minimal-data ALTCHA deployment would disable it and serve the widget and challenges from Pleey's infrastructure.

#### CAPTCHA option B: Cap

[Cap](https://github.com/tiagozip/cap) is Apache-2.0 licensed and self-hostable, with approximately 7.9k stars. Its [release history](https://github.com/tiagozip/cap/releases) lists `standalone@3.1.13` on September 23. Its [site](https://trycap.dev/) names bunny.net, AdGuard, and Fraunhofer as production users.

The [current core library](https://trycap.dev/guide/capjs-core) can be embedded, or a standalone service can be deployed. This is a strong alternative for the existing JavaScript stack. Cap also uses [instrumentation challenges](https://trycap.dev/guide/instrumentation). Its optional `blockAutomatedBrowsers` setting collects additional browser facts and documents compatibility uncertainties. Keep that blocking disabled for a minimal-data deployment and audit the enabled challenge configuration.

#### CAPTCHA option C: Friendly Captcha

[Friendly Captcha](https://friendlycaptcha.com/) offers managed protection, no image-labeling tasks, and EU-only endpoints on eligible plans. It reports thousands of organizational customers and 2.6 billion verified interactions annually. These are vendor-reported adoption figures.

Its [v2 integration SDK](https://github.com/FriendlyCaptcha/friendly-captcha-sdk) is MPL-2.0 licensed, but this does not make the complete CAPTCHA service an open-source, freely self-hostable stack. Enterprise self-hosted endpoints are a commercial offering. Consider it if managed operations become more important than the full open-source requirement.

#### CAPTCHA option D: Cloudflare Turnstile

[Turnstile](https://developers.cloudflare.com/turnstile/get-started/) is an established managed alternative. Cloudflare continues to develop it, including its [September 2026 integration tooling](https://blog.cloudflare.com/turnstile-spin/). It is free to use and does not require proxying the site through Cloudflare.

The protection service is proprietary. Its [privacy addendum](https://www.cloudflare.com/turnstile-privacy-policy/) documents processing of IP addresses, TLS fingerprints, and browser headers, including use to improve detection. It therefore does not satisfy the full open-source and local-processing preferences.

#### Other evaluated CAPTCHA options

- [mCaptcha](https://github.com/mCaptcha/mCaptcha): self-hosted, AGPL-3.0, proof-of-work. Its [server releases](https://github.com/mCaptcha/mCaptcha/releases) and [component activity](https://github.com/mCaptcha) provide less recent server/client maintenance evidence than ALTCHA or Cap. Core-library activity in 2026 means it should not be described as abandoned.
- [mosparo](https://mosparo.io/): MIT, self-hosted, actively maintained, including [v1.5.7 on September 24](https://mosparo.io/releases/release-v1-5-7/). Its [content-based filtering](https://documentation.mosparo.io/docs/about/how_it_works) is a better fit for contact or comment forms. Our assessment is that an email-only recovery form provides limited input for that primary mechanism.

## Decision

Use option 2 for this initiative. Within its recovery-delivery slice, use recovery delivery option B. For signup and recovery abuse prevention, use CAPTCHA option B (Cap), accepted by the project owner on 2026-09-27.

- Use exactly two account root models plus a dependent session model: `User` owns username, avatar, timestamps, and game/workspace relationships; `UserAuthentication` owns the unique login email, password hash, reset-token hash/expiry, and pending recovery delivery state; `UserSession` persists one account session per sign-in beneath `UserAuthentication`. `UserAuthentication` keeps the user foreign key as its primary key with cascading deletion. Account creation writes the authentication and profile rows atomically. Email is projected into the existing profile API from authentication storage; profile queries select only that email and never credentials or token data. A separate authentication repository handles credential reads and session operations. Authentication lifecycle follows the user's soft-delete status.
- The migration preserves user IDs and game/workspace relationships while moving credentials and recovery state off the `users` table into authentication rows, then removing the old columns and queue table. Existing refresh tokens cannot be migrated because previous JWTs lack the per-session identifier required by the new model, so deployment forces a fresh sign-in.
- The backend owns authentication and session validity. Access JWTs have an explicit token purpose and session identifier. Refresh JWTs have a unique identifier and SHA-256 digest; rotation uses a conditional database update on the matching session row. Deployment configuration sets the access lifetime to one hour and the refresh lifetime to a sliding 14 days, renewed while the application is open or making authenticated requests. Both lifetimes use the existing JWT configuration. Login creates a new session. Logout revokes only the current session. Password reset revokes every session for the account.
- Capture bounded User-Agent and the server-observed IP at sign-in. Display these as informational browser, OS, and sign-in-address hints together with sign-in time, last authenticated activity, and expiry. Client metadata never authorizes requests. No geolocation service is used.
- API authentication and authenticated realtime connections validate the stored session. Realtime packets are revalidated; idle authenticated connections are checked every 15 seconds and disconnected when invalid. Missing credentials mean guest access; rejected credentials never silently become guest access.
- Authenticated activity updates at most once per minute on authenticated HTTP requests and realtime packets. Idle socket validation does not count as user activity.
- Authenticated queries return the current session plus a separate paginated list of other active sessions in one frontend GraphQL operation. Session list contracts follow [ADR 0011](./0011-standardize-list-query-pagination.md), including scoped counts, deterministic ordering, and repeatable-read snapshots for each page.
- Users may revoke one of their other sessions or all other sessions. Scope every session query and mutation to the authenticated account and never expose token material or digests. Revocation removes the session row, invalidating API access and refresh immediately and idle sockets through their existing validation interval. Expired sessions are omitted from active-session queries and cleaned up on subsequent sign-in.
- The frontend owns only the current validated account view and persisted credentials. Startup validates with `me`, including one coordinated refresh on expiration. Stale refresh responses cannot resurrect a cleared or replaced session. Authorization failures do not trigger renewal. Open tabs synchronize through storage notifications and serialize renewal with Web Locks when available, rereading persisted credentials before rotation. Guest session persistence remains separate.
- Concurrent HTTP queries share a request only within the same credentials and session revision. Each request captures its credentials before dispatch. Storage updates for the already validated account session revalidate in the background, preserving mounted screens and drafts; replacement sessions and sign-out clear the account view before validation.
- Explicit sign-out takes precedence over background restoration of that session. Retry eligibility distinguishes renewal of the same account/session from session replacement or revocation, so an expired in-flight request may retry with that session's renewed credentials without crossing an account boundary.
- Password requests execute the same conditional scheduling query and return the same response for every syntactically valid address. Unknown or deleted accounts schedule no delivery. Database cooldowns prevent repeated mail to an account. A bounded background worker claims pending authentication rows, issues 256-bit random tokens, stores only SHA-256 digests, and sends localized mail through Nodemailer SMTP. Tokens expire after 30 minutes and are consumed atomically with password replacement and session revocation in the same authentication row. Delivery failures retry with bounded lifetime; no token, URL, or address is logged. Email changes clear pending recovery work and reset tokens.
- Reset links use a configured frontend origin, with the token in the URL fragment to keep it out of HTTP requests and referrers. Reset does not sign in automatically.
- Expose recovery configuration through the backend Helm chart: an explicit trusted frontend URL, SMTP endpoint/sender/TLS mode, reset-token lifetime, and a bundled `smtp` dependency enabled by default. Keep a ClusterIP submission service and persistent queue, and permit upstream chart configuration through that values block.
- Automatically select the bundled relay when enabled. When it is disabled, require the external host and use the existing recovery SMTP port, TLS, and credential settings. External SMTP authentication reads both credentials from an existing Kubernetes Secret mounted as files.
- Require STARTTLS between the backend and the bundled relay. Generate a release-scoped CA/server certificate Secret, retaining it across upgrades, or accept an operator-managed Secret. Mount only the CA into the backend through `NODE_EXTRA_CA_CERTS`; do not weaken application TLS validation. Reject missing required recovery settings during rendering, and roll backend pods when the generated runtime ConfigMap changes.
- Limit SMTP ingress to backend pods using a dedicated NetworkPolicy. Exclude SMTP pods from the umbrella policy's broad release-level ingress rule.
- Configure permitted sender domains explicitly. Direct internet delivery still requires sender DNS, a suitable outbound IP, and port 25 connectivity; an upstream provider can be configured instead. Development may opt out and keep using Mailpit.
- In Docker Compose development, keep Mailpit SMTP on the application network and route its web UI through the existing Traefik proxy. Publish neither Mailpit port on the host by default, avoiding additional host port reservations. Host-only backend workflows can explicitly opt into a loopback SMTP binding.
- Keep the global application shell and its main landmark. Replace the authentication marketing layout with a responsive account surface, a compact identity header, and a clear workspace return link.
- Use `/identity/profile` for profile details, `/identity/profile/security` for security, and `/identity/profile/history` for history through one optional route parameter. Native routed links expose the current page and preserve browser history without introducing tab-specific keyboard conventions.
- Show vertical section navigation on desktop and a compact horizontal navigation row on mobile. Use the existing theme variables for surfaces, typography, borders, and interaction states; keep all visible and accessible text in the identity locale resources.
- Keep the profile form mounted across section navigation so unfinished edits are preserved. Provide explicit save and discard actions with honest pending, success, and error feedback. Profile and avatar actions have independent feedback.
- The security section loads on entry, identifies the current session, offers refresh and paginated other-session cards, and confirms remote revocation. Show distinct loading, empty, mutation-error, and success states in English and French. Keep the existing current-device sign-out and password-recovery actions.
- History loads when visited and retains pagination while switching sections. Present compact session rows with game type, role, date, status, and the user's score, plus distinct loading, retry, and actionable empty states. The API takes no target user identifier and returns no other player's identity or score. Soft-deleted records and records beneath deleted projects or organizations are excluded.
- Keep account history and remote-session operations behind an account gateway resolved by profile hooks; the global authentication context owns the current session lifecycle. Share the account/page request lifecycle between history and session lists while retaining their distinct caching and mutation behavior.
- Compose the account surface from shared layout, typography, feedback, and navigation primitives. Responsive behavior belongs to those primitives rather than screen-level style objects or injected CSS. Password recovery forms use the shared field validation contract for both policy and confirmation errors.

### Explicit runtime configuration

Runtime configuration validates supplied values without supplying defaults. Required settings fail startup when absent or invalid; genuinely optional settings remain absent. Deployment manifests, environment examples, and test fixtures own their explicit values. Refresh-token signing keys must also be supplied explicitly rather than falling back to the access-token key.

Do not select application behavior from environment names such as development or production. `NODE_ENV` remains required metadata for telemetry and third-party tooling. Configure GraphiQL, GraphQL introspection, GraphQL schema output, translation watching, frontend HTTPS enforcement, and SMTP TLS explicitly. Resolve translation assets relative to the application module in both source and compiled builds. Helm enables frontend HTTPS enforcement and SMTP TLS, while Compose explicitly configures its local HTTP and Mailpit workflow. An explicitly empty trusted-proxy list trusts only the observed peer.

### Signup and recovery abuse prevention

Embed `capjs-core` in the NestJS backend and bundle `@cap.js/widget` with the frontend. Keep challenge instrumentation disabled for a proof-of-work-only, minimal-data integration. Use the existing Valkey deployment for atomic replay protection, token consumption, and request limits across replicas.

Expose action-scoped challenge and redemption endpoints under `/api/identity/captcha/:action/`, with `signup` and `password-recovery` actions. Require `captchaToken` on signup and recovery-email submissions. Store only hashed verification token keys with their action and expiry. A dedicated `CAP_SECRET` signs challenges and must remain consistent across replicas. The existing signed-in recovery action uses the same control. Bundle Cap's WebAssembly assets locally as well as its JavaScript.

Resolve rate-limit client addresses only through explicitly configured trusted proxy IPs/CIDRs; use the observed peer when the explicit trust list is empty. The deployment configuration exposes the trust list and the CAPTCHA signing secret.

Integration requirements:

- Verify proofs on the backend before account creation or recovery scheduling, for every transport exposing either operation.
- Use short-lived, signed challenges scoped to the operation, with atomic single-use enforcement shared across backend replicas. Rate-limit challenge issuance and protected actions.
- Bundle the widget locally, disable interaction collection and optional CAPTCHA cookies, and avoid forwarding emails, passwords, or reset tokens to a CAPTCHA service.
- Preserve generic recovery responses and the delivery cooldown. CAPTCHA failures must not depend on whether an email address exists.
- Keep verification behind an application port and the widget behind the existing frontend abstraction boundaries; follow the [development guidance](../../development/index.md) for errors and translations.
- Provide localized progress, expiry, retry, and failure states. Verification outages must not silently bypass the control.

## Consequences

### Positive

- Recovery, expiration, per-device auditing, rotation, and revocation have explicit and testable behavior.
- Account tasks have stable, shareable locations and clear navigation on phones and desktops.
- Account discovery and SMTP latency are separated from the recovery request response.
- Installations receive a managed outgoing queue and an explicit external-provider opt-out.
- Deployment reuses upstream workload, storage, and configuration templates.
- Backend-to-relay traffic remains encrypted and certificate-verified.
- Existing account and guest flows retain their ownership boundaries.
- CAPTCHA processing can stay within Pleey's infrastructure.
- Cap has no mandatory paid service or separate CAPTCHA deployment.
- Users can complete the forms without solving image puzzles.

### Negative

- Deployment needs SMTP configuration and a trusted frontend URL.
- The development Mailpit UI inherits Traefik's network exposure; its hostname is routing configuration, not a loopback-only access restriction.
- The bundled relay adds a StatefulSet, persistent storage, and certificate lifecycle responsibilities.
- Postfix needs a root master process; upstream manages its worker privileges.
- Bundling a relay does not provision external email deliverability or sender DNS.
- Revocable access adds a database lookup at authenticated transport boundaries.
- Session auditing adds stored IP/User-Agent data and throttled activity writes.
- Profile email reads join the authentication relation; that relation selects only the email. Recovery delivery shares the authentication row and remains limited to one pending request per account.
- Persisted browser tokens retain the existing exposure to scripts executing in the origin; an HttpOnly cookie migration remains separate work.
- Active-session auditing is not a historical sign-in log; revoked rows are removed.
- Browser and OS labels are hints, not verified identity attributes.
- The profile coordinates a small amount of section and form state.
- Proof-of-work consumes client resources and still permits bots willing to perform the computation; difficulty must be tested on slower phones. See [Cap's explanation of this mechanism's limits](https://trycap.dev/guide/effectiveness).
- Replay storage, distributed request limits, monitoring, and dependency maintenance remain application responsibilities.
- Public adoption evidence for the open-source candidates is incomplete.

### Follow-Up

- Review this ADR alongside the implementation of #478.
- Apply the identity migration before deploying and configure SMTP with TLS in production.
- Validate both bundled and external recovery rendering and a TLS delivery path to an isolated test receiver.
- Publish chart configuration and certificate-renewal guidance alongside the deployment values.
- Configure trusted proxies explicitly before relying on end-client IP addresses.
- Verify keyboard navigation, long account names, session pagination and revocation states, empty/error history, and narrow screens in both supported languages.
- Monitor delivery failures and apply deployment-level request limits in addition to the per-address cooldown.
- Pin compatible current Cap widget/core releases and check security advisories during maintenance.
- Verify missing, forged, expired, replayed, concurrent, and wrong-operation proofs, including direct API submissions.
- Measure solve time and completion failures on mobile and assistive technologies in both locales.
- Inspect browser traffic and configuration to confirm data-minimization behavior.

## References

- [OWASP password recovery guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Nodemailer SMTP transport](https://nodemailer.com/smtp)
- [Upstream Postfix chart](https://github.com/bokysan/docker-postfix/tree/v5.1.0/helm/mail)
- [Node additional CA certificates](https://nodejs.org/api/cli.html#node_extra_ca_certsfile)
