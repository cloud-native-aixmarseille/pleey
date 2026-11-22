# Pleey implementation specifications

Created: 2026-11-20. Revised: 2026-11-22 (revision 2, anonymous identity retention). Repository baseline: `89eba30755f53aced04b596bc1531854a15bc1d5` in `cloud-native-aixmarseille/pleey`.

This package defines six implementation phases. Each phase produces one complete PR and one releasable production version. Execute them in order. A phase can depend on earlier merged phases; it must never require a later phase to build, deploy, secure or operate the functionality it exposes.

## Revision 2: anonymous participation is the primary workload

The user reports approximately 99% of party participants have no registered account. The previous revision incorrectly made retained guest history a blocker for auth-user deletion and instructed historical guests to become new auth users. Those requirements are withdrawn and replaced throughout this package.

Phase 02 now ships complete bounded anonymous retention, not a promise to add it later. Better Auth anonymous identities are temporary; PartyParticipant and retained scores/history are independent. PartyParticipant.userId is nullable, new historical-only imports create no auth users, and expired guest binding cleanup works even while the party remains active. The required scheduler, current-transport transition, transfer deadlines, native-session race tests and basic monitoring are part of that same PR. Phase 04 ports the workflow to the fenced Colyseus boundary. Phase 05 expands operational automation only.

See DOMAIN-CONTRACTS D12 for the normative lifecycle. Automatic link deletion stays disabled until safe application transfer completion, but indefinite guest retention is forbidden. Registered-account lists/counts exclude temporary auth identities. There is no second authenticator or permanent replacement Actor table. Retained nicknames/results are pseudonymous historical data, not a claim of proven anonymization.

This revision still has six phases and adds 14 acceptance cases, for 124 total. It supersedes the anonymous-retention parts of the earlier architecture report and specification edition. No application implementation or performance result is implied.

## Release sequence

| Phase | PR outcome | The complete product after deployment |
| --- | --- | --- |
| 01 | Reproducible production delivery | The current Pleey product runs from a pnpm workspace with deterministic CI, production configuration, migration/restore rehearsal and a recorded behavior inventory. |
| 02 | Unified identity and sessions | Every identity consumer uses Better Auth; guest identities have automatic bounded retention and history survives their deletion. Old guest credentials and custom JWT authentication are gone. |
| 03 | REST management and frontend data | Every application HTTP workflow uses REST/OpenAPI and the generated client; TanStack Query owns management data. GraphQL and Apollo are gone. |
| 04 | Durable Colyseus gameplay | All game modes and controls run through Colyseus and durable PostgreSQL commands. Mobile recovery, private state, crash recovery and two-worker ownership are complete. Socket.IO is gone. |
| 05 | Operational growth and recovery | Operators can safely grow, drain and shrink the deployment, perform compatible releases, restore data and investigate recovery or capacity failures. |
| 06 | Installable PWA and safe updates | The already functional browser application becomes installable, with public asset caching and an update policy that does not interrupt a game. |

Do not create a seventh cleanup phase. Replaced code, dependencies, routes, configuration and obsolete tests are deleted in the PR that replaces them.

## What clean replacement means during these releases

An unreplaced component remains the sole implementation of its responsibility until its phase. For example, Phase 02 changes the existing game transport to accept only Better Auth cookies; it does not create a second guest-authentication protocol. Phase 04 then deletes that transport.

Never deploy old and new implementations of the same responsibility side by side. No V1/V2 route switch, credential fallback, dual writes, compatibility facade, dormant replacement application or feature flag concealing incomplete work is allowed. An offline one-time data converter and an offline rollback artifact are permitted; neither is an active application path.

The gameplay replacement is deliberately a substantial PR. Authentication, persistence, game rules, synchronization, browser recovery, authorization and deployment must work together before it can merge. Internal implementation steps can use many commits, but they are not separately mergeable releases.

## Files to read

1. The checked-out repository's `AGENTS.md`, scoped instructions and linked architecture/development documentation.
2. [EXECUTION-CONTRACT.md](EXECUTION-CONTRACT.md).
3. [DOMAIN-CONTRACTS.md](DOMAIN-CONTRACTS.md).
4. The requested file in [phases/](phases/).
5. The applicable acceptance cases indexed by [ACCEPTANCE-CATALOG.md](ACCEPTANCE-CATALOG.md).
6. [SOURCES.md](SOURCES.md) when implementing or verifying a library integration.

[AGENT-PROMPT.md](AGENT-PROMPT.md) is the dispatch prompt. [phase-manifest.json](phase-manifest.json) records the machine-readable dependency and evidence structure.

All common contracts are part of every phase specification. Requirements identify the phase where they first apply. Do not create empty implementations for future-phase requirements.

## Decisions already made

- Use NestJS/Express, Better Auth with its anonymous plugin, PostgreSQL/Prisma, Colyseus, Valkey, React, XState and TanStack Query.
- Use one browser origin and cookie identity. No new game-ticket system.
- Retain guest authentication only for valid sessions/bounded transfer work. Durable party history uses participant IDs and never pins an anonymous auth user.
- Use native Colyseus requests, synchronization and reconnect. Pleey owns business receipts and durable game rules.
- Use the existing quiz and prediction semantics from accepted ADR 0017. Predictions use authored correct options. Do not introduce a new live host-outcome resolution feature during this work.
- Imported registered accounts retain their ownership and receive a password-reset transition. Do not retain a legacy password verifier or pretend one-way hashes can be converted.
- Start with complete ordinary desktop/mobile browser support. PWA installation is Phase 06; Dexie and offline answer queues are excluded.
- Allow coordinated breaking releases and planned cutovers. There is no promise to continue an old live party through an identity/runtime migration.
- Preserve valuable content, organization relationships, media and historical results through audited data conversion. Code replacement is not authorization to erase production data.
- Keep all required infrastructure self-hostable and publicly available under explicit open-source licenses. Optional external exporters may not block startup.

## First agent task

Implement Phase 01 only. Open one PR with its required evidence. Do not implement Phase 02 in the same PR, and do not claim production deployment occurred unless it actually did. Repeat the same process for each subsequent phase after its predecessor is merged.

These specifications authorize implementation scope and verification requirements. They are not proof that the application has already been implemented, load-tested or deployed.
