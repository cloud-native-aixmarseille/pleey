# ADR 0009: Redesign account identity, recovery, sessions, and delivery

- Status: Proposed
- Proposed date: 2026-09-09
- Accepted date: N/A

## Context

[Issue #478](https://github.com/cloud-native-aixmarseille/pleey/issues/478) requires working password recovery, a private account workspace, account history, and consistent session recovery, auditing, and revocation. The existing account surface mixes public authentication and private account tasks, stores only one refresh token on the user row, leaves access tokens valid after logout, truncates refresh-token input through bcrypt, and trusts persisted browser profiles without server validation.

The same initiative also needs a production-ready recovery delivery path. External SMTP-only configuration leaves every installation to provision its own relay, while development-oriented capture tools do not satisfy real password recovery delivery.

## Decision Drivers

- Recovery must not disclose account existence or store recoverable reset tokens.
- Logout, remote revocation, and password changes must revoke authenticated access across API and realtime boundaries.
- Let users inspect and terminate individual account sessions without affecting guest identity.
- Give account tasks stable, shareable locations with responsive navigation and localized feedback.
- Send recovery messages to their recipients and retain queued mail across restarts.
- Preserve production TLS and certificate verification for recovery delivery.
- Retain external SMTP configuration when the bundled relay is disabled.
- Keep application policy behind ports and infrastructure in adapters.

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

## Decision

Use option 2 for this initiative. Within its recovery-delivery slice, use recovery delivery option B.

- Use exactly two account root models plus a dependent session model: `User` owns username, avatar, timestamps, and game/workspace relationships; `UserAuthentication` owns the unique login email, password hash, reset-token hash/expiry, and pending recovery delivery state; `UserSession` persists one account session per sign-in beneath `UserAuthentication`. `UserAuthentication` keeps the user foreign key as its primary key with cascading deletion. Account creation writes the authentication and profile rows atomically. Email is projected into the existing profile API from authentication storage; profile queries select only that email and never credentials or token data. A separate authentication repository handles credential reads and session operations. Authentication lifecycle follows the user's soft-delete status.
- The migration preserves user IDs and game/workspace relationships while moving credentials and recovery state off the `users` table into authentication rows, then removing the old columns and queue table. Existing refresh tokens cannot be migrated because previous JWTs lack the per-session identifier required by the new model, so deployment forces a fresh sign-in.
- The backend owns authentication and session validity. Access JWTs have an explicit token purpose and session identifier. Refresh JWTs have a unique identifier and SHA-256 digest; rotation uses a conditional database update on the matching session row. Default access lifetime is one hour; refresh lifetime is a sliding 14 days, renewed while the application is open or making authenticated requests. Both lifetimes use the existing JWT configuration. Login creates a new session. Logout revokes only the current session. Password reset revokes every session for the account.
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
- Require STARTTLS between the backend and the bundled relay. Generate a release-scoped CA/server certificate Secret, retaining it across upgrades, or accept an operator-managed Secret. Mount only the CA into the backend through `NODE_EXTRA_CA_CERTS`; do not weaken application TLS validation. Reject missing production recovery settings during rendering, and roll backend pods when the generated runtime ConfigMap changes.
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

## Consequences

### Positive

- Recovery, expiration, per-device auditing, rotation, and revocation have explicit and testable behavior.
- Account tasks have stable, shareable locations and clear navigation on phones and desktops.
- Account discovery and SMTP latency are separated from the recovery request response.
- Installations receive a managed outgoing queue and an explicit external-provider opt-out.
- Deployment reuses upstream workload, storage, and configuration templates.
- Backend-to-relay traffic remains encrypted and certificate-verified.
- Existing account and guest flows retain their ownership boundaries.

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

### Follow-Up

- Review this ADR alongside the implementation of #478.
- Apply the identity migration before deploying and configure SMTP with TLS in production.
- Validate both bundled and external recovery rendering and a TLS delivery path to an isolated test receiver.
- Publish chart configuration and certificate-renewal guidance alongside the deployment values.
- Configure trusted proxies explicitly before relying on end-client IP addresses.
- Verify keyboard navigation, long account names, session pagination and revocation states, empty/error history, and narrow screens in both supported languages.
- Monitor delivery failures and apply deployment-level request limits in addition to the per-address cooldown.

## References

- [OWASP password recovery guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Nodemailer SMTP transport](https://nodemailer.com/smtp)
- [Upstream Postfix chart](https://github.com/bokysan/docker-postfix/tree/v5.1.0/helm/mail)
- [Node additional CA certificates](https://nodejs.org/api/cli.html#node_extra_ca_certsfile)
