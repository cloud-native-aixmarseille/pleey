# ADR Index

Architecture Decision Records are mandatory in this repository.

Every architecture, technology, and design choice must start with an ADR before implementation begins.

## Scope

Create an ADR when a change affects any of the following:

- architecture boundaries or module ownership
- framework or library selection
- data flow or integration patterns
- transport or protocol choices
- persistence, caching, or messaging strategy
- UI system, design system, or interaction model choices with structural impact
- cross-cutting operational concerns such as scalability, observability, security, or deployment model

If a change can alter how the system is structured, operated, or extended, it needs an ADR.

## Rules

1. Start with an ADR, not a free-form proposal.
2. Create the ADR before implementation starts.
3. Use the repository template in [template.md](./template.md).
4. Place ADRs in this directory using `NNNN-kebab-case-title.md`.
5. Start with `Status: Proposed`.
6. For accepted ADRs, set the accepted date from the earliest relevant commit that shows the decision was adopted.
7. Update the same ADR as the decision moves to `Accepted`, `Rejected`, or `Superseded`.
8. Link implementation work and follow-up changes back to the ADR.

## Workflow

1. Copy the template.
2. Capture the context, drivers, considered options, and decision.
3. Review the ADR before or alongside implementation review.
4. Only implement once the ADR direction is agreed.
5. For retrospective accepted ADRs, derive the accepted date from commit history.
6. Update the ADR status and consequences when the decision changes.

## Registry

- 0001: [Adopt the current application stack](./0001-adopt-the-current-application-stack.md) - Accepted - 2026-08-15
- 0002: [Use Clean Architecture with strict boundaries](./0002-use-clean-architecture-with-strict-boundaries.md) - Accepted - 2026-08-15
- 0003: [Use an internal design system on top of Mantine](./0003-use-an-internal-design-system-on-top-of-mantine.md) - Accepted - 2026-08-15
- 0004: [Use GraphQL for the primary API and Socket.IO for realtime](./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md) - Accepted - 2026-08-15
- 0005: [Adopt the current test strategy](./0005-adopt-the-current-test-strategy.md) - Accepted - 2026-08-15
- 0006: [Use GraphQL subscriptions instead of custom stage-management event flows where useful](./0006-limit-graphql-subscriptions-to-secondary-realtime-surfaces.md) - Proposed - 2026-08-15
- 0007: [Upgrade the backend to NestJS 12](./0007-upgrade-the-backend-to-nestjs-12.md) - Accepted - 2026-08-28
