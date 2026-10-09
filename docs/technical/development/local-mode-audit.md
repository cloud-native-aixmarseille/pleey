# Local Mode and Offline Runtime Audit

- Audit date: 2026-10-09
- Scope: the Docker Compose development stack and the browser/backend runtime it hosts
- Decision record: [ADR 0012 — Run Pleey locally without public internet access](../architecture/adr/0012-run-pleey-locally-without-public-internet.md)

## Executive Summary

Pleey's application services are mostly local at runtime, but the repository does not yet guarantee an end-to-end internet-independent setup and run:

- **A running stack is not fully offline:** the frontend's global stylesheet unconditionally imports four Google Fonts from `fonts.googleapis.com`. The browser requests this third party on page load. If it cannot connect, fallback fonts should preserve functionality, but the request violates a no-internet runtime requirement.
- **A cold setup is not offline-capable:** `make setup` may pull the Traefik image and builds app images that install OS packages and npm dependencies. The development containers also run `npm install` every time they start. These steps rely on artifacts being available from registries or caches.
- **The core local services are present:** Compose runs PostgreSQL, Valkey, Mailpit, the backend, frontend, and an OpenTelemetry collector. The CAPTCHA widget assets and proof-of-work verification are bundled/implemented locally, and the widget calls the local backend. Password-reset mail is delivered to local Mailpit.
- **Local tracing has a separate topology gap:** the collector exports traces to `jaeger:4317`, but no Jaeger service is defined in Compose. This does not create a public-internet dependency or prevent the app from serving requests, but local trace export is not complete.

**Conclusion:** Pleey can run with its core application behavior on a machine that has already acquired the required artifacts, with public internet access unavailable, but this has not been demonstrated as a supported, repeatable mode and is not strictly internet-independent because of the font import. A first-time disconnected setup from only a source checkout is not supported by the current workflow.

## Findings

| Area | Current behavior and evidence | Impact |
| --- | --- | --- |
| Browser runtime | [`index.css`](../../../application/frontend/src/index.css#L1) imports Google Fonts. The CAPTCHA widget uses same-origin API paths and Vite-served local WASM assets ([widget adapter](../../../application/frontend/src/infrastructure/identity/cap-widget.adapter.tsx#L52), [asset configuration](../../../application/frontend/src/infrastructure/identity/cap-widget-assets.ts#L1)). | Font retrieval is an unconditional public-network request; the CAPTCHA path does not require a hosted CAPTCHA service. |
| Backend runtime | Compose configures PostgreSQL, Valkey, Mailpit, and the OTLP collector by local service name ([Compose](../../../compose.yaml#L5)). CAPTCHA challenges are generated and checked in the backend, with Valkey used for nonce, token, and rate-limit state ([CAPTCHA adapter](../../../application/backend/src/infrastructure/identity/captcha/cap-captcha-adapter.ts#L28)). | Core API, realtime state, CAPTCHA, and development recovery-mail delivery can remain on the local Compose network. |
| Observability | The backend points to `otel-collector:4318` ([Compose](../../../compose.yaml#L102)); the collector sends traces to `jaeger:4317` ([collector config](../../../docker/otel-collector/config.yaml#L16)), but Compose defines no Jaeger service. | No public egress is needed, but local trace export is incomplete. This is not an application-serving blocker. |
| Image and package acquisition | The app Dockerfiles install OS packages and run `npm ci` during image builds ([backend](../../../application/backend/Dockerfile#L5), [frontend](../../../application/frontend/Dockerfile#L5)). The backend runs Prisma generation ([Dockerfile](../../../application/backend/Dockerfile#L25)); its Prisma packages enable install scripts ([package manifest](../../../application/backend/package.json#L121)), so the required engine binaries must also be present locally. `make setup` builds images and invokes Traefik setup ([Makefile](../../../Makefile#L93)); a missing Traefik image is pulled ([Makefile](../../../Makefile#L175)). | A fresh setup needs registry access unless all base images, service images, OS packages, npm packages, and Prisma engine binaries are already cached or supplied locally. |
| Development container start | The backend and frontend entrypoints run `npm install` at each container start ([backend](../../../application/backend/Dockerfile#L82), [frontend](../../../application/frontend/Dockerfile#L92)). | Even after image construction, restart behavior is not designed or verified for a disconnected environment. |
| Optional external links | The feedback URL is optional and read from frontend configuration ([environment reader](../../../application/frontend/src/infrastructure/config/app-env-reader.ts#L8)); CAPTCHA provider attribution is a link ([widget adapter](../../../application/frontend/src/infrastructure/identity/cap-widget.adapter.tsx#L14)). | These are user-selected navigation, not required background requests. A configured feedback destination may be unreachable offline. |

The existing Makefile also adds chart repositories for chart testing; that is a development/test workflow, not a requirement for running the Compose application ([Makefile](../../../Makefile#L426)).

## Remediation Plan

This plan is prospective; this audit does not claim the fixes below have been implemented.

### Priority 0 — Remove public requests from the normal runtime

1. Remove the remote Google Fonts import. Use local font assets with appropriate redistribution licenses, or existing system-font fallbacks if bundling fonts is not appropriate.
2. Keep the CAPTCHA widget, WASM, API endpoint, and verification flow self-hosted. Treat any new third-party runtime integration as an explicit, optional capability rather than a default dependency.
3. Verify the production frontend and development server request no public origins during ordinary use, including authentication, CAPTCHA, party join/play, and avatar loading.

### Priority 1 — Make disconnected startup reproducible

1. Separate artifact preparation from local startup. Document and automate how to acquire or export/import the exact Docker images and dependency artifacts needed by a disconnected machine, including Prisma engine binaries.
2. Remove `npm install` from development container entrypoints. Install from the lockfile as part of a deliberate build/install step, and have startup execute the already-installed application.
3. Ensure the standard local stack owns its required network and proxy services, or clearly document and provision any required external Docker network. A disconnected startup must not implicitly pull an image.
4. Pin image references and record the versions/digests needed by the offline artifact bundle. Include PostgreSQL, Valkey, Mailpit, the collector, proxy, and application images.
5. Document which host tools and artifacts must already be present before internet disconnection; a source checkout alone cannot supply Docker images or npm/OS packages.

### Priority 2 — Complete local observability

Choose and document one local tracing arrangement: provide the Jaeger service expected by the collector, or remove that exporter from the local collector configuration. Keep telemetry local and non-fatal to application startup.

### Priority 3 — Prove the contract continuously

1. Add an offline smoke test that starts from the prepared artifact set with public egress blocked, checks backend readiness and frontend availability, and exercises login, CAPTCHA, and a local recovery-mail flow.
2. Capture browser network requests during representative journeys and fail the check on requests to public origins. Allow only the local application origin and explicitly declared local service endpoints.
3. Verify both first startup and subsequent restart with the machine disconnected; assert that no package manager or image pull is attempted.
4. Document the online preparation and disconnected run steps separately, and state any intentionally unavailable features (for example, opening an externally configured feedback link).

## Acceptance Criteria for a Fully Local Mode

- The browser and application containers make no required request to a public host during normal application use.
- CAPTCHA challenges, static assets, persistent state, and development email delivery are served by the local installation.
- After the documented artifact-preparation step, a disconnected machine can start and restart the full application without registry, package repository, or other public-network access.
- Offline tests cover core user journeys and detect newly introduced public runtime dependencies.
- Optional external links are clearly distinguished from application functionality that is expected to work offline.
