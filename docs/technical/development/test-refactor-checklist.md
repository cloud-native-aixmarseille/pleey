# Test Refactor Checklist

Generated on 2026-08-14 from the current `scripts/check-test-conventions.mjs` output.

Status legend:

- `[ ]` Not started
- `[x]` Completed

Global enforcement status:

- `[x]` Add shared test-conventions checker in `scripts/check-test-conventions.mjs`
- `[x]` Wire the checker into backend lint scripts
- `[x]` Wire the checker into frontend lint scripts
- `[x]` Document enforced and manual test-writing rules in technical docs and unit-test instructions
- `[x]` Keep this checklist updated as each file is refactored

Manual review rules to apply while refactoring each file:

- `[ ]` Keep Arrange, Act, and Assert explicit and ordered
- `[ ]` Remove overlapping behavior coverage when multiple tests prove the same outcome
- `[ ]` Prefer shared fixtures and test doubles from `src/test-utils/`
- `[ ]` Prefer fixture defaults and override only scenario-specific fields

## Backend

Summary:

- 0 files currently fail the test-conventions checker
- 0 files need lifecycle-hook removal
- 0 files need inline helper extraction in addition to lifecycle-hook cleanup

### App and Integration Specs

- `[x]` Refactor [application/backend/src/app/modules/app-module.integration.spec.ts](application/backend/src/app/modules/app-module.integration.spec.ts)
  Remove `afterEach` and make setup explicit per test.

- `[x]` Refactor [application/backend/test/app.e2e-spec.ts](application/backend/test/app.e2e-spec.ts)
  Remove lifecycle-hook setup and keep Arrange local to each test.

### Application Layer

- `[x]` Refactor [application/backend/src/application/game/party/host/use-cases/get-host-party-observation-use-case.spec.ts](application/backend/src/application/game/party/host/use-cases/get-host-party-observation-use-case.spec.ts)
  Remove `beforeEach` and replace it with explicit per-test arrangement helpers.

- `[x]` Refactor [application/backend/src/application/game/party/host/use-cases/host-party-runtime-use-cases.spec.ts](application/backend/src/application/game/party/host/use-cases/host-party-runtime-use-cases.spec.ts)
  Remove `afterEach` and keep cleanup/setup visible inside each test path.

- `[x]` Refactor [application/backend/src/application/game/party/player/use-cases/get-player-party-observation-use-case.spec.ts](application/backend/src/application/game/party/player/use-cases/get-player-party-observation-use-case.spec.ts)
  Remove `beforeEach` and keep local Arrange helpers explicit.

- `[x]` Refactor [application/backend/src/application/game/party/shared/use-cases/broadcast-party-observation-use-case.spec.ts](application/backend/src/application/game/party/shared/use-cases/broadcast-party-observation-use-case.spec.ts)
  Remove `beforeEach` and keep setup local to each test.

- `[x]` Refactor [application/backend/src/application/game/party/shared/use-cases/list-parties-use-case.spec.ts](application/backend/src/application/game/party/shared/use-cases/list-parties-use-case.spec.ts)
  Remove `beforeEach` and keep setup local to each test.

- `[x]` Refactor [application/backend/src/application/game/party/shared/use-cases/load-party-observation-snapshot-use-case.spec.ts](application/backend/src/application/game/party/shared/use-cases/load-party-observation-snapshot-use-case.spec.ts)
  Remove `beforeEach` and keep setup local to each test.

### Domain Layer

- `[x]` Refactor [application/backend/src/domain/game/party/host/services/host-party-lifecycle-policy.spec.ts](application/backend/src/domain/game/party/host/services/host-party-lifecycle-policy.spec.ts)
  Remove `afterEach` and keep cleanup explicit in each scenario.

- `[x]` Refactor [application/backend/src/domain/identity/services/password-service.spec.ts](application/backend/src/domain/identity/services/password-service.spec.ts)
  Remove `beforeEach` and inline the setup through local Arrange helpers.

### Infrastructure Layer

- `[x]` Refactor [application/backend/src/infrastructure/identity/services/dicebear-avatar-generator-adapter.spec.ts](application/backend/src/infrastructure/identity/services/dicebear-avatar-generator-adapter.spec.ts)
  Remove `beforeEach` and keep setup local.

### Presentation Layer

- `[x]` Refactor [application/backend/src/presentation/game/management/graphql/game-management-resolver.graphql.spec.ts](application/backend/src/presentation/game/management/graphql/game-management-resolver.graphql.spec.ts)
  Remove `beforeEach` and express setup per test.

- `[x]` Refactor [application/backend/src/presentation/game/party/graphql/party-management-resolver.graphql.spec.ts](application/backend/src/presentation/game/party/graphql/party-management-resolver.graphql.spec.ts)
  Remove `beforeEach` and express setup per test.

- `[x]` Refactor [application/backend/src/presentation/game/party/realtime/party-observer-gateway.spec.ts](application/backend/src/presentation/game/party/realtime/party-observer-gateway.spec.ts)
  Extract `createPartyPlayerSessionRegistryMock` into shared test utilities.
  Remove `afterEach` and keep cleanup/setup explicit per scenario.

- `[x]` Refactor [application/backend/src/presentation/health/http/health-controller.http.int.spec.ts](application/backend/src/presentation/health/http/health-controller.http.int.spec.ts)
  Remove `beforeEach` and keep test setup explicit.

- `[x]` Refactor [application/backend/src/presentation/shared/error-handling/i18n-http-exception-filter.spec.ts](application/backend/src/presentation/shared/error-handling/i18n-http-exception-filter.spec.ts)
  Remove `beforeEach` and keep local Arrange helpers explicit.

- `[x]` Refactor [application/backend/src/presentation/shared/error-handling/i18n-ws-exception-filter.spec.ts](application/backend/src/presentation/shared/error-handling/i18n-ws-exception-filter.spec.ts)
  Remove `beforeEach` and keep local Arrange helpers explicit.

## Frontend

Summary:

- 0 files currently fail the test-conventions checker
- All current frontend violations are lifecycle-hook removals

### App and Infrastructure

- `[x]` Refactor [application/frontend/src/app/routing/route-registry.spec.tsx](application/frontend/src/app/routing/route-registry.spec.tsx)
  Remove `beforeEach` and keep route setup explicit per test.

- `[x]` Refactor [application/frontend/src/i18n/config/init.spec.ts](application/frontend/src/i18n/config/init.spec.ts)
  Remove `afterEach` and make cleanup explicit per test.

- `[x]` Refactor [application/frontend/src/infrastructure/config/app-env-reader.spec.ts](application/frontend/src/infrastructure/config/app-env-reader.spec.ts)
  Remove `afterEach` and keep setup/cleanup explicit.

- `[x]` Refactor [application/frontend/src/infrastructure/game/party/shared/socket-io-party-observation.adapter.spec.ts](application/frontend/src/infrastructure/game/party/shared/socket-io-party-observation.adapter.spec.ts)
  Remove `beforeEach` and keep connection/setup explicit per test.

- `[x]` Refactor [application/frontend/src/infrastructure/graphql/client/graphql-client.spec.ts](application/frontend/src/infrastructure/graphql/client/graphql-client.spec.ts)
  Remove `beforeEach` and keep setup explicit per test.

### Party and Live Presentation

- `[x]` Refactor [application/frontend/src/presentation/game/party/shared/screens/components/party-final-summary-panel.spec.tsx](application/frontend/src/presentation/game/party/shared/screens/components/party-final-summary-panel.spec.tsx)
  Remove `afterEach` and keep cleanup explicit per test.

- `[x]` Refactor [application/frontend/src/presentation/game/party/shared/screens/party-lobby-screen.spec.tsx](application/frontend/src/presentation/game/party/shared/screens/party-lobby-screen.spec.tsx)
  Remove `afterEach` and keep screen setup local to each scenario.

- `[x]` Refactor [application/frontend/src/presentation/game/party/shared/screens/use-party-screen-wake-lock.spec.ts](application/frontend/src/presentation/game/party/shared/screens/use-party-screen-wake-lock.spec.ts)
  Remove `afterEach` and keep cleanup explicit.

- `[x]` Refactor [application/frontend/src/presentation/game/types/prediction/screens/live/components/prediction-runtime-panels.spec.tsx](application/frontend/src/presentation/game/types/prediction/screens/live/components/prediction-runtime-panels.spec.tsx)
  Remove `afterEach` and keep setup/cleanup local.

- `[x]` Refactor [application/frontend/src/presentation/game/types/shared/management/playable-content-management-screen.spec.tsx](application/frontend/src/presentation/game/types/shared/management/playable-content-management-screen.spec.tsx)
  Remove `beforeEach` and keep setup explicit per scenario.

- `[x]` Refactor [application/frontend/src/presentation/game/types/shared/screens/live/components/use-stage-reveal-phase.spec.ts](application/frontend/src/presentation/game/types/shared/screens/live/components/use-stage-reveal-phase.spec.ts)
  Remove both lifecycle hooks and keep timer/setup logic local per test.

### Identity and Shared UI

- `[x]` Refactor [application/frontend/src/presentation/identity/screens/profile/profile-screen.spec.tsx](application/frontend/src/presentation/identity/screens/profile/profile-screen.spec.tsx)
  Remove `beforeEach` and keep auth/screen setup explicit.

- `[x]` Refactor [application/frontend/src/presentation/identity/screens/register/register-screen.spec.tsx](application/frontend/src/presentation/identity/screens/register/register-screen.spec.tsx)
  Remove `beforeEach` and keep setup explicit.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/data/qr-share-card.spec.tsx](application/frontend/src/presentation/shared/ui/data/qr-share-card.spec.tsx)
  Remove `afterEach` and keep cleanup explicit.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/feedback/presentation-toast.spec.tsx](application/frontend/src/presentation/shared/ui/feedback/presentation-toast.spec.tsx)
  Remove `afterEach` and keep cleanup explicit.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/overlay/confirm-dialog.spec.tsx](application/frontend/src/presentation/shared/ui/overlay/confirm-dialog.spec.tsx)
  Remove `afterEach` and keep cleanup explicit.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/patience/hooks/use-patience-delay.spec.ts](application/frontend/src/presentation/shared/ui/patience/hooks/use-patience-delay.spec.ts)
  Remove `afterEach` and keep timer cleanup explicit.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/patience/hooks/use-user-idle.spec.ts](application/frontend/src/presentation/shared/ui/patience/hooks/use-user-idle.spec.ts)
  Remove `afterEach` and keep timer/event cleanup explicit.

### Workspace Presentation

- `[x]` Refactor [application/frontend/src/presentation/workspace/dashboard/routes/dashboard-routes-factory.spec.tsx](application/frontend/src/presentation/workspace/dashboard/routes/dashboard-routes-factory.spec.tsx)
  Remove `beforeEach` and keep route setup explicit per test.

- `[x]` Refactor [application/frontend/src/presentation/workspace/dashboard/screens/home/dashboard-home-screen.spec.tsx](application/frontend/src/presentation/workspace/dashboard/screens/home/dashboard-home-screen.spec.tsx)
  Remove `beforeEach` and keep screen setup explicit per scenario.

- `[x]` Refactor [application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-overview-panel.spec.tsx](application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-overview-panel.spec.tsx)
  Remove `beforeEach` and keep setup explicit per test.

- `[x]` Refactor [application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-project-list.spec.tsx](application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-project-list.spec.tsx)
  Remove `beforeEach` and keep setup explicit per test.

- `[x]` Refactor [application/frontend/src/presentation/workspace/organizations/screens/management/components/project-form-dialog.spec.tsx](application/frontend/src/presentation/workspace/organizations/screens/management/components/project-form-dialog.spec.tsx)
  Remove `beforeEach` and keep setup explicit per test.

## Progress Log

- `[x]` Refactor [application/backend/src/application/game/management/use-cases/list-project-games-use-case.spec.ts](application/backend/src/application/game/management/use-cases/list-project-games-use-case.spec.ts)
  Consolidated duplicate async rejection assertions into one assertion.

- `[x]` Refactor [application/backend/src/application/game/party/host/use-cases/create-party-use-case.spec.ts](application/backend/src/application/game/party/host/use-cases/create-party-use-case.spec.ts)
  Removed lifecycle-hook setup in favor of explicit local Arrange helpers.

- `[x]` Refactor [application/backend/src/application/game/party/host/use-cases/get-host-party-observation-use-case.spec.ts](application/backend/src/application/game/party/host/use-cases/get-host-party-observation-use-case.spec.ts)
  Removed lifecycle-hook setup in favor of explicit local Arrange helpers.

- `[x]` Refactor [application/backend/src/application/game/party/host/use-cases/host-party-runtime-use-cases.spec.ts](application/backend/src/application/game/party/host/use-cases/host-party-runtime-use-cases.spec.ts)
  Removed lifecycle hooks and restored `Date.now` spies explicitly inside the tests that use them.

- `[x]` Refactor [application/backend/src/application/game/party/player/use-cases/get-player-party-observation-use-case.spec.ts](application/backend/src/application/game/party/player/use-cases/get-player-party-observation-use-case.spec.ts)
  Removed lifecycle-hook setup in favor of explicit local Arrange helpers.

- `[x]` Refactor [application/backend/src/application/game/party/shared/use-cases/broadcast-party-observation-use-case.spec.ts](application/backend/src/application/game/party/shared/use-cases/broadcast-party-observation-use-case.spec.ts)
  Removed lifecycle-hook setup in favor of explicit local Arrange helpers.

- `[x]` Refactor [application/backend/src/application/game/party/shared/use-cases/list-parties-use-case.spec.ts](application/backend/src/application/game/party/shared/use-cases/list-parties-use-case.spec.ts)
  Removed lifecycle-hook setup in favor of explicit local Arrange helpers.

- `[x]` Refactor [application/backend/src/application/game/party/shared/use-cases/load-party-observation-snapshot-use-case.spec.ts](application/backend/src/application/game/party/shared/use-cases/load-party-observation-snapshot-use-case.spec.ts)
  Removed lifecycle-hook setup in favor of explicit local Arrange helpers.

- `[x]` Refactor [application/backend/src/domain/identity/services/password-service.spec.ts](application/backend/src/domain/identity/services/password-service.spec.ts)
  Removed lifecycle-hook setup in favor of explicit per-test service construction.

- `[x]` Refactor [application/backend/src/infrastructure/identity/services/dicebear-avatar-generator-adapter.spec.ts](application/backend/src/infrastructure/identity/services/dicebear-avatar-generator-adapter.spec.ts)
  Removed lifecycle-hook setup in favor of explicit per-test service construction.

- `[x]` Refactor [application/backend/src/presentation/shared/error-handling/i18n-http-exception-filter.spec.ts](application/backend/src/presentation/shared/error-handling/i18n-http-exception-filter.spec.ts)
  Removed lifecycle-hook setup in favor of explicit local Arrange helpers.

- `[x]` Refactor [application/backend/src/presentation/shared/error-handling/i18n-ws-exception-filter.spec.ts](application/backend/src/presentation/shared/error-handling/i18n-ws-exception-filter.spec.ts)
  Removed lifecycle-hook setup in favor of explicit local Arrange helpers.

- `[x]` Refactor [application/backend/src/domain/game/party/host/services/host-party-lifecycle-policy.spec.ts](application/backend/src/domain/game/party/host/services/host-party-lifecycle-policy.spec.ts)
  Removed lifecycle-hook cleanup and restored `Date.now` spies explicitly in the tests that use them.

- `[x]` Refactor [application/backend/src/presentation/game/management/graphql/game-management-resolver.graphql.spec.ts](application/backend/src/presentation/game/management/graphql/game-management-resolver.graphql.spec.ts)
  Removed lifecycle-hook setup in favor of explicit resolver arrangement per test.

- `[x]` Refactor [application/backend/src/presentation/game/party/graphql/party-management-resolver.graphql.spec.ts](application/backend/src/presentation/game/party/graphql/party-management-resolver.graphql.spec.ts)
  Removed lifecycle-hook setup in favor of explicit resolver arrangement per test.

- `[x]` Refactor [application/backend/src/app/modules/app-module.integration.spec.ts](application/backend/src/app/modules/app-module.integration.spec.ts)
  Removed unnecessary lifecycle-hook cleanup and kept module compilation self-contained per test.

- `[x]` Refactor [application/backend/src/presentation/health/http/health-controller.http.int.spec.ts](application/backend/src/presentation/health/http/health-controller.http.int.spec.ts)
  Replaced shared lifecycle-hook setup with an explicit healthy-indicator arrangement helper.

- `[x]` Refactor [application/backend/test/app.e2e-spec.ts](application/backend/test/app.e2e-spec.ts)
  Replaced lifecycle-hook setup with explicit app bootstrap, env setup, and backend-root cwd restoration.

- `[x]` Refactor [application/backend/src/presentation/game/party/realtime/party-observer-gateway.spec.ts](application/backend/src/presentation/game/party/realtime/party-observer-gateway.spec.ts)
  Moved the session-registry double into shared test utilities and replaced file-level timer cleanup with explicit fake-timer scopes.

- `[x]` Add shared backend session-registry double in [application/backend/src/test-utils/mock-factories/party-player-session-registry.mock-factory.ts](application/backend/src/test-utils/mock-factories/party-player-session-registry.mock-factory.ts)

- `[x]` Refactor [application/frontend/src/i18n/config/init.spec.ts](application/frontend/src/i18n/config/init.spec.ts)
  Replaced shared localStorage cleanup with explicit per-test setup and teardown.

- `[x]` Refactor [application/frontend/src/infrastructure/config/app-env-reader.spec.ts](application/frontend/src/infrastructure/config/app-env-reader.spec.ts)
  Replaced shared env cleanup with explicit per-test env stubbing and teardown.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/patience/hooks/use-patience-delay.spec.ts](application/frontend/src/presentation/shared/ui/patience/hooks/use-patience-delay.spec.ts)
  Replaced shared timer cleanup with explicit fake-timer scopes.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/patience/hooks/use-user-idle.spec.ts](application/frontend/src/presentation/shared/ui/patience/hooks/use-user-idle.spec.ts)
  Replaced shared timer cleanup with explicit fake-timer scopes.

- `[x]` Refactor [application/frontend/src/app/routing/route-registry.spec.tsx](application/frontend/src/app/routing/route-registry.spec.tsx)
  Replaced shared sequence reset with explicit registry arrangement per test.

- `[x]` Refactor [application/frontend/src/infrastructure/graphql/client/graphql-client.spec.ts](application/frontend/src/infrastructure/graphql/client/graphql-client.spec.ts)
  Replaced shared fetch cleanup with explicit per-test fetch stubbing and teardown.

- `[x]` Refactor [application/frontend/src/infrastructure/game/party/shared/socket-io-party-observation.adapter.spec.ts](application/frontend/src/infrastructure/game/party/shared/socket-io-party-observation.adapter.spec.ts)
  Replaced shared socket reset with explicit per-test socket-state setup.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/data/qr-share-card.spec.tsx](application/frontend/src/presentation/shared/ui/data/qr-share-card.spec.tsx)
  Replaced shared timer cleanup with explicit fake-timer scopes and deterministic copy-state transitions.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/feedback/presentation-toast.spec.tsx](application/frontend/src/presentation/shared/ui/feedback/presentation-toast.spec.tsx)
  Replaced shared global cleanup with explicit per-test `matchMedia` teardown.

- `[x]` Refactor [application/frontend/src/presentation/shared/ui/overlay/confirm-dialog.spec.tsx](application/frontend/src/presentation/shared/ui/overlay/confirm-dialog.spec.tsx)
  Replaced shared global cleanup with explicit per-test mobile layout teardown.

- `[x]` Refactor [application/frontend/src/presentation/game/party/shared/screens/components/party-final-summary-panel.spec.tsx](application/frontend/src/presentation/game/party/shared/screens/components/party-final-summary-panel.spec.tsx)
  Replaced shared `matchMedia` cleanup with explicit per-test teardown.

- `[x]` Refactor [application/frontend/src/presentation/game/party/shared/screens/use-party-screen-wake-lock.spec.ts](application/frontend/src/presentation/game/party/shared/screens/use-party-screen-wake-lock.spec.ts)
  Replaced shared wake-lock and visibility cleanup with explicit per-test environment restoration.

- `[x]` Refactor [application/frontend/src/presentation/game/types/shared/screens/live/components/use-stage-reveal-phase.spec.ts](application/frontend/src/presentation/game/types/shared/screens/live/components/use-stage-reveal-phase.spec.ts)
  Replaced shared fake-timer lifecycle hooks with explicit per-test timer scopes.

- `[x]` Refactor [application/frontend/src/presentation/workspace/dashboard/routes/dashboard-routes-factory.spec.tsx](application/frontend/src/presentation/workspace/dashboard/routes/dashboard-routes-factory.spec.tsx)
  Replaced shared sequence reset with explicit route-factory arrangement per test.

- `[x]` Refactor [application/frontend/src/presentation/identity/screens/profile/profile-screen.spec.tsx](application/frontend/src/presentation/identity/screens/profile/profile-screen.spec.tsx)
  Replaced shared auth mock reset with explicit screen arrangement per test.

- `[x]` Refactor [application/frontend/src/presentation/identity/screens/register/register-screen.spec.tsx](application/frontend/src/presentation/identity/screens/register/register-screen.spec.tsx)
  Replaced shared register mock reset with explicit screen arrangement per test.

- `[x]` Refactor [application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-overview-panel.spec.tsx](application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-overview-panel.spec.tsx)
  Replaced shared callback reset with explicit per-test callback arrangement.

- `[x]` Refactor [application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-project-list.spec.tsx](application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-project-list.spec.tsx)
  Replaced shared callback reset with explicit per-test callback arrangement.

- `[x]` Refactor [application/frontend/src/presentation/workspace/organizations/screens/management/components/project-form-dialog.spec.tsx](application/frontend/src/presentation/workspace/organizations/screens/management/components/project-form-dialog.spec.tsx)
  Replaced shared callback reset with explicit per-test arrangement and preserved per-test submit mocking.

- `[x]` Refactor [application/frontend/src/presentation/game/types/prediction/screens/live/components/prediction-runtime-panels.spec.tsx](application/frontend/src/presentation/game/types/prediction/screens/live/components/prediction-runtime-panels.spec.tsx)
  Replaced shared timer and global cleanup with explicit per-test environment restoration.

- `[x]` Refactor [application/frontend/src/presentation/game/types/shared/management/playable-content-management-screen.spec.tsx](application/frontend/src/presentation/game/types/shared/management/playable-content-management-screen.spec.tsx)
  Replaced shared gateway reset with explicit per-test gateway-default arrangement.

- `[x]` Refactor [application/frontend/src/presentation/workspace/dashboard/screens/home/dashboard-home-screen.spec.tsx](application/frontend/src/presentation/workspace/dashboard/screens/home/dashboard-home-screen.spec.tsx)
  Replaced shared route and fixture reset with a local test wrapper that performs explicit per-test setup.

- `[x]` Refactor [application/frontend/src/presentation/game/party/shared/screens/party-lobby-screen.spec.tsx](application/frontend/src/presentation/game/party/shared/screens/party-lobby-screen.spec.tsx)
  Replaced shared cleanup with a local test wrapper that restores timers and route state after each scenario.

- `[x]` Validate full backend lint pipeline
  `application/backend` `npm run lint` passed after the refactor.

- `[x]` Validate full frontend lint pipeline
  `application/frontend` `npm run lint` passed after the refactor.

- `[x]` Validate full backend test suite
  `application/backend` `npm run test` passed: 93 files passed, 5 skipped; 346 tests passed, 9 skipped.

- `[x]` Validate full frontend test suite
  `application/frontend` `npm run test` passed: 175 files passed; 756 tests passed.

- `[x]` Refactor [application/frontend/src/presentation/identity/screens/sign-in/sign-in-screen.spec.tsx](application/frontend/src/presentation/identity/screens/sign-in/sign-in-screen.spec.tsx)
  Removed lifecycle-hook setup and made screen arrangement explicit per test.

- `[x]` Refactor [application/frontend/src/infrastructure/identity/persisted-auth-session.adapter.spec.ts](application/frontend/src/infrastructure/identity/persisted-auth-session.adapter.spec.ts)
  Moved the inline transport mock into shared test utilities.

- `[x]` Add shared frontend transport double in [application/frontend/src/test-utils/mocks/auth-session-transport-mock-factory.ts](application/frontend/src/test-utils/mocks/auth-session-transport-mock-factory.ts)
