# Sources and decision boundaries

## Repository baseline

The repository was inspected at commit `89eba30755f53aced04b596bc1531854a15bc1d5`. Paths under `application/` in these references are source evidence from that baseline. The `apps/` and `packages/` paths in the phase specs are the new layout implemented by Phase 01. Before implementation, compare the current branch against this baseline and preserve newer legitimate product changes.

The actual repository starts with npm package lockfiles, two promoted application images, a GraphQL/Apollo HTTP stack, Socket.IO gameplay and custom identity/guest paths. The pnpm workspace, Better Auth, REST/OpenAPI, Colyseus runtime and third image are target changes with assigned phases, not assumed current infrastructure.

## Architecture decisions

These specifications preserve the selected target architecture and replace the earlier milestone ordering with six independently releasable PRs. The requirements for no parallel legacy implementation, optional registration, ordinary mobile browsers, complete self-hosting and unlimited implementation effort come from the user's instructions.

The thresholds, queue bounds, session settings, release workflow, actor rules, phase assignment and acceptance tests are normative choices in this specification. They are not claimed defaults or guarantees of a third-party framework. Capacity targets still require measurement in the implementation.

The investigation inspected Colyseus source at `31bb1a8bd1359d742c104a370cb32eb5cdf69721`, including native request dispatch, room authentication/reconnection, routing and publication behavior. Better Auth 1.7.27 and its official integration guidance were checked. The implementation must select and test exact publicly released compatible packages; repository HEAD or a documentation example is not a tested deployment.

Preserve accepted scoring ADR 0017. The reading-phase projection restriction in this program deliberately strengthens the old UI-only withholding of options. Ordinary non-host organization administration does not implicitly grant live HOST control. These are recorded explicitly so an implementation agent does not guess.

## Anonymous lifecycle revision, 2026-11-22

The user's reported 99% guest participation changes retention requirements, not the choice to reuse native authentication. S06 confirms that anonymous sign-in creates a native user/session and that disableDeleteAnonymousUser affects link-time/explicit deletion; it does not supply a scheduled retention policy. S07 defines expiry/refresh behavior. D12's deadlines, scheduler cadence, batch size and backlog target are Pleey policy choices to implement and measure.

S69 supports nullable binding and uniqueness semantics. S70 supplies maintained in-process scheduling, not distributed correctness or durable work by itself. S71 distinguishes tuple reuse/maintenance from immediate filesystem shrinkage. The resulting schema, lifecycle state machine and failure gates are design requirements, not capabilities claimed to be automatic in those libraries.

## Primary references

- **S01. Audited Pleey commit:** [https://github.com/cloud-native-aixmarseille/pleey/commit/89eba30755f53aced04b596bc1531854a15bc1d5](https://github.com/cloud-native-aixmarseille/pleey/commit/89eba30755f53aced04b596bc1531854a15bc1d5)
- **S02. Pleey architecture and ADR policy:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/index.md](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/index.md)
- **S03. Colyseus SDK: requests and synchronization:** [https://docs.colyseus.io/sdk](https://docs.colyseus.io/sdk)
- **S04. Colyseus async request dispatch, pinned source:** [https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/core/src/RoomMessages.ts](https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/core/src/RoomMessages.ts)
- **S05. Colyseus reconnection:** [https://docs.colyseus.io/room/reconnection](https://docs.colyseus.io/room/reconnection)
- **S06. Better Auth anonymous plugin:** [https://better-auth.com/docs/plugins/anonymous](https://better-auth.com/docs/plugins/anonymous)
- **S07. Better Auth session management:** [https://better-auth.com/docs/concepts/session-management](https://better-auth.com/docs/concepts/session-management)
- **S08. Better Auth Express integration:** [https://better-auth.com/docs/integrations/express](https://better-auth.com/docs/integrations/express)
- **S09. Better Auth Prisma integration:** [https://better-auth.com/docs/adapters/prisma](https://better-auth.com/docs/adapters/prisma)
- **S10. Better Auth 1.7.27 security fixes:** [https://github.com/better-auth/better-auth/releases/tag/v1.7.27](https://github.com/better-auth/better-auth/releases/tag/v1.7.27)
- **S11. Colyseus WebSocket transport and upgrade hooks:** [https://docs.colyseus.io/server/transport/ws](https://docs.colyseus.io/server/transport/ws)
- **S12. Colyseus room admission and reconnect, pinned source:** [https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/core/src/Room.ts](https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/core/src/Room.ts)
- **S13. Colyseus StateView:** [https://docs.colyseus.io/state/view](https://docs.colyseus.io/state/view)
- **S14. Colyseus multi-process scaling:** [https://docs.colyseus.io/scalability](https://docs.colyseus.io/scalability)
- **S15. Colyseus driver responsibilities:** [https://docs.colyseus.io/server/driver](https://docs.colyseus.io/server/driver)
- **S16. p-queue: bounded application sequencing building block:** [https://github.com/sindresorhus/p-queue](https://github.com/sindresorhus/p-queue)
- **S17. Valkey compatibility and migration:** [https://valkey.io/topics/migration/](https://valkey.io/topics/migration/)
- **S18. XState v5:** [https://stately.ai/docs/xstate/v5](https://stately.ai/docs/xstate/v5)
- **S19. React external store subscriptions:** [https://react.dev/reference/react/useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- **S20. TanStack Query defaults:** [https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- **S21. Vite PWA prompt-based updates:** [https://vite-pwa-org.netlify.app/guide/prompt-for-update.html](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html)
- **S22. Browser page lifecycle:** [https://developer.chrome.com/docs/web-platform/page-lifecycle-api](https://developer.chrome.com/docs/web-platform/page-lifecycle-api)
- **S23. Colyseus UniqueSessionPlugin limitations:** [https://docs.colyseus.io/room/plugins/unique-session](https://docs.colyseus.io/room/plugins/unique-session)
- **S24. Colyseus React bindings repository:** [https://github.com/colyseus/react-tools](https://github.com/colyseus/react-tools)
- **S25. Colyseus Traefik helper limitations and setup:** [https://docs.colyseus.io/scalability/traefik](https://docs.colyseus.io/scalability/traefik)
- **S26. Colyseus licensing and maintenance model:** [https://docs.colyseus.io/sponsors](https://docs.colyseus.io/sponsors)
- **S27. fast-check model-based tests:** [https://fast-check.dev/docs/advanced/model-based-testing/](https://fast-check.dev/docs/advanced/model-based-testing/)
- **S28. Testcontainers for Node.js:** [https://node.testcontainers.org/](https://node.testcontainers.org/)
- **S29. Colyseus load testing:** [https://docs.colyseus.io/tools/loadtest](https://docs.colyseus.io/tools/loadtest)
- **S30. NestJS OpenAPI:** [https://docs.nestjs.com/openapi/introduction](https://docs.nestjs.com/openapi/introduction)
- **S31. Better Auth MIT license:** [https://github.com/better-auth/better-auth/blob/main/LICENSE.md](https://github.com/better-auth/better-auth/blob/main/LICENSE.md)
- **S32. OWASP WebSocket security:** [https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)
- **S33. Browser Web Locks:** [https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- **S34. Better Auth Prisma adapter transaction option, pinned source:** [https://github.com/better-auth/better-auth/blob/v1.7.27/packages/prisma-adapter/src/prisma-adapter.ts](https://github.com/better-auth/better-auth/blob/v1.7.27/packages/prisma-adapter/src/prisma-adapter.ts)
- **S35. Colyseus proxy helper source:** [https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/traefik/src/index.ts](https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/traefik/src/index.ts)
- **S36. Better Auth session query flags, pinned source:** [https://github.com/better-auth/better-auth/blob/v1.7.27/packages/better-auth/src/cookies/session-store.ts](https://github.com/better-auth/better-auth/blob/v1.7.27/packages/better-auth/src/cookies/session-store.ts)
- **S37. Colyseus client path and token handling, pinned source:** [https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/sdk/src/Client.ts](https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/sdk/src/Client.ts)
- **S38. Colyseus command dispatcher source:** [https://github.com/colyseus/command/blob/46c0001d33736c5992dd1694476e043c8c63adac/src/index.ts](https://github.com/colyseus/command/blob/46c0001d33736c5992dd1694476e043c8c63adac/src/index.ts)
- **S39. Colyseus development restart behavior:** [https://docs.colyseus.io/server/devmode](https://docs.colyseus.io/server/devmode)
- **S40. PostgreSQL transaction isolation:** [https://www.postgresql.org/docs/17/transaction-iso.html](https://www.postgresql.org/docs/17/transaction-iso.html)
- **S41. Current CI workflow:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/workflows/__shared-ci.yml](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/workflows/__shared-ci.yml)
- **S42. Current release workflow:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/workflows/release.yml](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/workflows/release.yml)
- **S43. Existing operations and media requirements:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/development/backend/operations.md](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/development/backend/operations.md)
- **S44. Accepted scoring ADR 0017:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/adr/0017-reward-action-quality-before-speed-in-game-scoring.md](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/adr/0017-reward-action-quality-before-speed-in-game-scoring.md)
- **S45. Current Pleey authentication and game baseline:** [https://github.com/cloud-native-aixmarseille/pleey/tree/89eba30755f53aced04b596bc1531854a15bc1d5/application](https://github.com/cloud-native-aixmarseille/pleey/tree/89eba30755f53aced04b596bc1531854a15bc1d5/application)
- **S46. pagination decision:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/adr/0011-standardize-list-query-pagination.md](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/adr/0011-standardize-list-query-pagination.md)
- **S47. quiz resolver:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/presentation/game/types/quiz/graphql/quiz-management-resolver.ts](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/presentation/game/types/quiz/graphql/quiz-management-resolver.ts)
- **S48. identity resolver:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/presentation/identity/graphql/auth-resolver.ts](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/presentation/identity/graphql/auth-resolver.ts)
- **S49. Zod JSON Schema:** [https://zod.dev/json-schema](https://zod.dev/json-schema)
- **S50. generator documentation:** [https://openapi-ts.dev/introduction](https://openapi-ts.dev/introduction)
- **S51. client documentation:** [https://openapi-ts.dev/openapi-fetch/](https://openapi-ts.dev/openapi-fetch/)
- **S52. Query cancellation:** [https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)
- **S53. Inspected WebSocket upgrade transport:** [https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/transport/ws-transport/src/WebSocketTransport.ts](https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/transport/ws-transport/src/WebSocketTransport.ts)
- **S54. PostgreSQL transaction isolation:** [https://www.postgresql.org/docs/current/transaction-iso.html](https://www.postgresql.org/docs/current/transaction-iso.html)
- **S55. Existing Helm deployment source:** [https://github.com/cloud-native-aixmarseille/pleey/tree/89eba30755f53aced04b596bc1531854a15bc1d5/charts/application](https://github.com/cloud-native-aixmarseille/pleey/tree/89eba30755f53aced04b596bc1531854a15bc1d5/charts/application)
- **S56. Pinned mobile UX instructions:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/instructions/frontend/player-mobile-ux.instructions.md](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/instructions/frontend/player-mobile-ux.instructions.md)
- **S57. guide authoring rules:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/development/frontend/user-guides.md](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/development/frontend/user-guides.md)
- **S58. Workbox lifecycle:** [https://developer.chrome.com/docs/workbox/service-worker-lifecycle](https://developer.chrome.com/docs/workbox/service-worker-lifecycle)
- **S59. skipWaiting documentation:** [https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting)
- **S60. Unregister behavior:** [https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/unregister](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/unregister)
- **S61. Pleey repository agent instructions:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/AGENTS.md](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/AGENTS.md)
- **S62. Pleey baseline schema:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/prisma/schema.prisma](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/prisma/schema.prisma)
- **S63. Pleey host lifecycle source:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/domain/game/party/host/services/host-party-lifecycle-policy.ts](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/domain/game/party/host/services/host-party-lifecycle-policy.ts)
- **S64. Pleey baseline player admission:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/application/game/party/player/use-cases/join-party-use-case.ts](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/application/game/party/player/use-cases/join-party-use-case.ts)
- **S65. Pleey baseline test setup:** [https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/scripts/test-runner.sh](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/scripts/test-runner.sh)
- **S66. Kubernetes StatefulSet update strategies:** [https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#update-strategies](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#update-strategies)
- **S67. Kubernetes horizontal autoscaling behavior:** [https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#configurable-scaling-behavior](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#configurable-scaling-behavior)
- **S68. pnpm script argument forwarding:** [https://pnpm.io/cli/run](https://pnpm.io/cli/run)

- **S69. PostgreSQL nullable foreign keys and uniqueness:** [https://www.postgresql.org/docs/current/ddl-constraints.html](https://www.postgresql.org/docs/current/ddl-constraints.html)
- **S70. NestJS task scheduling:** [https://docs.nestjs.com/application/task-scheduling](https://docs.nestjs.com/application/task-scheduling)
- **S71. PostgreSQL routine vacuuming:** [https://www.postgresql.org/docs/current/routine-vacuuming.html](https://www.postgresql.org/docs/current/routine-vacuuming.html)
