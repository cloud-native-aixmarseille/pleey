# Phase 06: Installable PWA and safe updates

## Phase and production outcome

- **One PR:** `feat(web): add installable PWA with non-disruptive updates`.
- **Dependencies:** Phases 01-05 are merged and their release gates pass.
- **Result:** Pleey can be installed where supported, launches with its public shell, and informs users about a waiting update without interrupting a party. Normal browser play remains fully functional when PWA capabilities are unavailable or disabled.
- **Stop condition:** installation, cache boundaries, update waiting, retirement and real-device behavior are verified in this PR. No later phase is required.

Read [EXECUTION-CONTRACT.md](../EXECUTION-CONTRACT.md), [DOMAIN-CONTRACTS.md](../DOMAIN-CONTRACTS.md), [ACCEPTANCE-CATALOG.md](../ACCEPTANCE-CATALOG.md), and the P5 release/runbook evidence. P5 has no service worker. P2/P4 already provide correct identity and mobile recovery; this phase must not become their implementation.

### Independence proof

Deploy P6, complete a party in a normal browser and an installed context, then deploy a second P6 build while both contexts remain open. The active game must continue on the existing bundle. After all old controlled Pleey windows close, relaunch and verify the new build. Finally deploy the documented PWA-retirement artifact and demonstrate ordinary browser play without worker caching. None of these checks may depend on development tools, a proprietary push service or a subsequent cleanup PR.

## Scope

Add the manifest, brand assets, supported installation affordances, public asset precaching, update notification and retirement procedure. Use `vite-plugin-pwa` and its Workbox integration. Prefer a generated worker with explicit configuration; do not build a generic browser synchronization framework.

Do not add Dexie, IndexedDB game persistence, background answer submission, push notifications, native wrappers, service-worker authentication, custom reconnect loops or offline editable game state. Do not request notification permission. Keep game credentials, native reconnect capabilities and Query data out of the worker and Cache Storage.

An installed browser app still experiences operating-system suspension. Preserve the existing XState/Colyseus recovery behavior and avoid promising background execution. The [browser lifecycle documentation](https://developer.chrome.com/docs/web-platform/page-lifecycle-api) describes why suspension and discard must be expected.

## Source paths to read

- `apps/web/vite.config.*`, application bootstrap, router and HTML shell.
- P2's session actor and P4's party actor, projection adapter and unknown-command-outcome UI.
- P5's static-asset retention, deployment/build compatibility and rollback procedures.
- `apps/web/public` or the P1-mapped asset directory, current theme assets and branding.
- Existing guide manifests/translations and the generated user documentation pipeline.
- [Pinned mobile UX instructions](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/instructions/frontend/player-mobile-ux.instructions.md) and [guide authoring rules](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/development/frontend/user-guides.md), using their current P5 equivalents.

Read the selected package version's actual configuration types and [Vite PWA prompt behavior](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html) before coding. Record pinned public package versions/license evidence in the existing dependency inventory.

## Contracts

### Manifest and installation

Use a stable application ID, same-origin scope and public start URL. The start URL must not contain a user ID, party capability, password, session value or analytics identifier. Use Pleey's actual name and branding, standalone display, an ordinary browser fallback, and icons suitable for both standard and maskable contexts, including 192px and 512px assets. Do not force portrait orientation; support projector, desktop and phone layouts.

Display an installation action only when the browser exposes the relevant capability or when platform-specific manual instructions are useful. Keep those instructions accurate for the tested platform/version. Installation is optional and must not block joining, answering, hosting, authentication or administration. Never simulate a native permission/install prompt.

The user-visible offline promise is limited: the public shell can open; playing and authoritative account/party actions require a connection. All labels are translated into English and French. An install prompt, offline notice or update notice must not move answer buttons during timed play.

### Cache allowlist

The worker may cache only immutable public build assets, icons, fonts and a static HTML shell whose bytes contain no personalized state. Derive the precache list from the build output, then validate it against the explicit allowlist. Do not use a broad runtime image/document cache simply because a URL ends in an image or HTML extension.

Exclude at least:

- `/api/**`, including Better Auth and all personalized management data.
- `/game/**`, matchmaking, seat reservations and worker connection paths.
- Media/upload/download routes that carry permissions or user content.
- Private-party URLs containing capabilities or passwords and any personalized document response.
- Query caches, auth actor snapshots, room snapshots, command receipts and unsent answers.
- External resources, telemetry responses and errors.

Use no general runtime response cache. Requests not matched by the public precache rules go to the network. Configure navigation fallback only for application document routes and explicitly deny API, game, media and file endpoints; an API outage must not return cached `index.html` with status 200. Existing `Cache-Control` headers remain useful but do not replace the worker's explicit routing policy.

Keep a namespaced cache prefix owned by this installation. Cleanup may delete only Pleey's documented cache names. Cache eviction or storage denial must degrade to network operation without clearing cookies or creating a new guest. Never require browser storage persistence permission for gameplay.

### Update policy: wait for old windows to close

Use prompt behavior, with an intentionally conservative activation policy:

1. Register the worker through exactly one integration after the normal application can start. A registration or install failure must not reject application bootstrap.
2. When an update reaches the waiting state, show a non-blocking localized notice: an update is ready; finish any party, close all Pleey tabs/app windows, and reopen.
3. Do not call `skipWaiting`, send a `SKIP_WAITING` message, invoke an update helper that does so, force `clients.claim`, or reload on `controllerchange`.
4. Let the browser activate the replacement when the previous worker no longer controls open clients. The next launch receives the updated application.
5. Keep old hashed assets available under P5's release retention policy. Do not delete current caches from an existing page while another window may still use them.

Explicitly set/check generated configuration so package defaults cannot silently enable immediate activation or automatic reload. The plugin's prompt helper is not permission to call its force-update function. Inspect the generated worker and verify behavior through a real browser update test.

This policy deliberately allows an update to remain waiting while an idle window stays open. Do not introduce heartbeat timeouts that guess a frozen tab is safe, or a custom multi-tab readiness election. An unresponsive/background tab is not evidence that the user has finished. The [Workbox lifecycle](https://developer.chrome.com/docs/workbox/service-worker-lifecycle) and [skipWaiting documentation](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting) explain the mechanisms; the no-forced-activation rule here is Pleey's product policy.

Show the notice in a stable secondary area. During a reading/answering phase or uncertain command result, suppress disruptive dialogs and retain an accessible status indication. The notice must not claim that clicking a button can close arbitrary browser tabs. A dismiss action hides it for the current session; it does not mark the update installed.

### Identity and offline behavior

An installed context may have a different cookie/session context from an already-open browser. Use P2's session check; do not import another tab's user ID or reconnect token as proof of identity. Account login and explicitly supported recovery remain the only authority for such transitions.

If launched offline, render the public shell and an unavailable/retry state. Do not create an anonymous identity when the server cannot confirm session absence. Do not claim successful answers or account changes. A retained same-identity in-memory view follows P4's recovery policy; it is not persisted by this phase.

When the network returns, let the existing actor perform one coalesced readiness/reconciliation path. The worker must not flush commands, reconnect the game socket or repeat a timed-out mutation. Logout/account changes still clear private rendered state and cancel old requests using the P2/P4 mechanisms.

## Ordered implementation checklist

1. Record the complete public build-asset allowlist and route denylist, manifest identity, cache prefix and update/retirement policy in the existing ADR and deployment docs.
2. Add compatible `vite-plugin-pwa`/Workbox dependencies and manifest/icons. Produce deterministic release artifacts with stable worker URL and content-derived build assets.
3. Configure public precaching and document fallback. Keep all dynamic/private requests on the network. Add a build assertion that accidental API/media URLs or embedded credentials cannot enter the precache manifest.
4. Add one worker registration boundary and non-blocking install/update/offline UI. Make errors observable through the existing sanitized logger; do not introduce frontend `console.*` calls.
5. Implement the waiting-only activation policy. Exercise two tabs and an installed window; confirm no code path invokes forced activation or reload.
6. Add a PWA-retirement build mode and operator procedure in this PR. Verify it against an already installed P6 worker, not merely a clean browser.
7. Extend release/upgrade tests to use actual built HTTPS-served artifacts at one origin. Preserve the same origin and browser profile between old/new builds so worker state survives.
8. Test real iPhone Safari and Android Chrome, both ordinary and installed contexts. Update guide source text, generated pages and screenshots.
9. Attach all test IDs, browser/device versions, release artifact digests and observed outcomes to the PR; declare anything not executed explicitly.

## Data and deployment requirements

There is no database migration and no identity-data import in this phase. A service worker and Cache Storage are persistent browser-side deployment state. Treat them as part of the release procedure even though no database table changes.

Serve the worker at a stable URL with revalidation behavior; do not mark it immutable. Serve content-hashed public assets with the established immutable policy. Verify HTTPS, manifest MIME type, scope, content security policy and deep links through the real reverse proxy. Do not introduce external font/CDN dependencies required for startup.

The existing compatible-build policy still applies. Caching old assets does not make an incompatible old game client supported forever. A breaking application release follows P5's coordinated procedure and explicit stale-client outcome, without service-worker forced reloads. When a worker controls the page or an update waits, PROTOCOL_INCOMPATIBLE must request the normal worker update check and instruct the user to close all Pleey tabs/installed windows, then reopen. Do not repeatedly call window.location.reload: the old worker could serve the same stale shell again. Show explicit unavailable/retry guidance if the new worker cannot be fetched; do not label an unfetched update ready.

Provide a documented deployment option for retiring PWA support. It must serve a tested retirement worker at the same URL/scope as the previous worker and disable future normal registration. The retirement worker uses natural activation, removes only Pleey-owned caches, unregisters itself and leaves normal network operation. Do not clear all origin storage, cookies or unrelated caches. Explain that users must close old Pleey windows before retirement completes. [Unregister behavior](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/unregister) is not equivalent to deleting previously cached content.

## Acceptance tests

Use real built artifacts for worker tests. Browser emulation alone is not evidence for operating-system suspension or installed iPhone behavior.

| ID | Given / when | Required assertion |
| --- | --- | --- |
| PWA-001 | Fresh HTTPS visit with supported browser | Valid manifest/icons/scope; one registration; ordinary play works before worker readiness |
| PWA-002 | Worker unsupported, registration rejected, quota exceeded or storage denied | Application remains usable online; no new guest/session/reset side effect |
| PWA-003 | Visit API/auth/matchmaking/private media and inspect Cache Storage | No personalized response, token, seat, private media or command payload is stored |
| PWA-004 | Navigate offline to an API/game/media URL | No cached HTML success response; normal unavailable/network error semantics |
| PWA-005 | Launch the previously cached shell offline | Clear offline state; no new anonymous bootstrap, accepted answer or mutation replay |
| PWA-006 | Active party in tab A, idle tab B, deploy build B | New worker waits; neither tab reloads or loses state; current game remains usable |
| PWA-007 | Suspended/hidden tab or installed window still uses old worker | Update remains waiting; no heartbeat-based assumption forces activation |
| PWA-008 | Unknown command outcome while update is waiting | Existing reconciliation completes; update notice does not force reload or duplicate command |
| PWA-009 | Close all old controlled windows, then relaunch | New build activates; old owned caches are cleaned at the safe lifecycle point; app works |
| PWA-010 | Account switch/logout with worker installed | No prior private cache/view returns; cookies and identity obey existing session rules |
| PWA-011 | Fresh installed context has no previous browser cookie | Server determines identity; no token/user-ID copying or false membership restoration |
| PWA-012 | Lock screen, switch apps and change Wi-Fi/cellular on real devices | P4 recovery remains correct; committed answers and participant identity are preserved where session remains valid |
| PWA-013 | Inspect update/install/offline UI in both locales, touch/keyboard/screen reader | Understandable labels, no layout shift of timed answer controls, no forced modal |
| PWA-014 | Deploy retirement mode over an installed P6 build, close/reopen | Old worker retires, only owned caches disappear, ordinary browser play works and cookies survive |
| PWA-015 | Change to an incompatible game protocol major with the old worker installed, then exercise rollback/retirement with retained caches | Explicit update-check/close-all-windows/reopen path obtains the new build; no repeated reload loop, false-ready update or missing-chunk dead end; documented compatible rollback/retirement works |
| PWA-016 | Return online after suspension/offline launch | Existing actor runs recovery; service worker sends no answers or auth mutations |

Run `pnpm verify`, `pnpm test:integration`, `pnpm test:e2e`, `pnpm test:release`, `pnpm test:upgrade`, and `pnpm deploy:render`. Extend the P1 runners with a PWA artifact scenario rather than writing a separate unmaintained deployment script. Include sequential-release fixture builds and retirement coverage in `test:upgrade`. Continue running the preexisting identity/game privacy and recovery gates.

## Production rollout and rollback

Release the complete worker, manifest, HTML and hashed assets together after the isolated upgrade tests pass. Smoke-test a clean browser and a browser with the previous deployment's state. Confirm the reported build, session check, public cache contents, one game join and waiting-update UI using a controlled synthetic party.

Stop rollout on private-cache entries, forced reload, repeated worker installation, stale-chunk loops, duplicate registration, lost session authority or background command replay. Leave normal gameplay available through the verified browser application.

For a PWA defect, prefer a corrected P6 artifact or its tested retirement mode. Rolling only the server image back to P5 does not remove the P6 worker from users' browsers. Keep the stable retirement-worker endpoint available long enough for returning clients and follow the close/reopen procedure. Do not add `skipWaiting` as an emergency shortcut or reset origin storage to conceal a broken update design. Database restoration is not part of this phase's rollback.

## Deletion and definition of done

Delete duplicate registration snippets, unused plugin auto-update helpers, accidental default cache routes and any PWA experiment replaced by this implementation. Preserve all existing ordinary-browser tests and recovery code. Document exactly which assets are public and which release artifacts must remain available.

The PR is done when all PWA acceptance IDs have evidence, real-device results are recorded, ordinary play passes with PWA disabled/unavailable, cached state contains no private data, updates never force an active window to reload, and retirement works from a previously installed worker. Include the operator runbook, tested build identifiers and cache-manifest inspection results. No follow-up cleanup or security PR may be required to leave this release deployed indefinitely.
