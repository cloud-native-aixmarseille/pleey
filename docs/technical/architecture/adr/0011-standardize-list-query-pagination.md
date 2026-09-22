# ADR 0011: Standardize list query pagination

- Status: Proposed
- Proposed date: 2026-09-10
- Accepted date: N/A

## Context

The audit covers all production GraphQL queries, their use-cases, repository reads,
and frontend consumers. Pleey already exposes numbered pages through
`PaginationInput`, `PaginationQuery`, `PaginatedResult<T>`, and `Paginated(T)`.
There was no ADR defining their contract or guard against divergent list APIs.

| Query at audit time | Findings |
| --- | --- |
| `myOrganizations`, `organizationMembers`, `organizationProjects` | Shared envelope; timestamp ordering without a unique tie-breaker |
| `projectGames` | Shared envelope; duplicated normalization; neither sort ends in a unique key |
| `listParties` | Shared envelope; timestamp ordering without a unique tie-breaker |
| `quizQuestions`, `predictionPrompts` | Unbounded arrays from database through GraphQL; editors assume complete contents |
| `myGameHistory` | Separate fixed-size `items/hasMore` envelope and page-only input |

Transport page-size validation already caps most inputs at 100, but application
normalization accepts oversized, fractional, and non-finite values and has no
upper page bound. Counts and rows are read in transactions with the database's
default isolation, which does not guarantee a shared snapshot on PostgreSQL.

## Decision Drivers

- Bound work and response size for every independently browsable collection.
- Preserve numbered-page navigation, filtered counts, and existing editor behavior.
- Apply tenant, authorization, and soft-delete scope before counting or paging.
- Make the convention enforceable across transport, persistence, and consumers.

## Considered Options

### Option 1: Standardize the existing offset contract

Use the existing envelope and database `skip`/`take`. This supports direct page
navigation and arbitrary supported sorts with a small migration surface. Deep
offsets and exact counts cost more as collections grow; concurrent changes can
move rows between separately requested pages.

### Option 2: Migrate every collection to cursor connections

Use opaque cursors, a unique ordering, edges/nodes, and page information. This is
a stronger fit for large feeds and sequential traversal, but changes existing
numbered navigation and requires cursor validation, filter binding, and indexed
keyset predicates for each supported sort. Encoding an offset does not remove
offset costs. There is no evidence from this audit that such a migration is
needed for every current screen.

### Option 3: Keep endpoint-specific pagination

Retains incompatible envelopes and makes resource limits and client traversal
harder to review. Rejected.

## Decision

Implement option 1 for every current list query. This is a project convention,
not a claim that offset pagination is the universal GraphQL standard.

### Contract

- Public list queries accept an input extending `PaginationInput` and return an
  object extending `Paginated(ItemType)`. Bare root lists and custom envelopes
  are forbidden. Domain contracts use `PaginatedResult<T>`.
- `page` is a one-based integer in `1..10000`; `pageSize` is an integer in `1..100`.
  Shared defaults are page 1 and size 9. Consumers may explicitly request another
  supported size. Invalid transport values are rejected. The shared application
  normalizer defensively normalizes trusted/internal calls into these bounds,
  including non-finite and fractional numbers; never duplicate the arithmetic.
- Responses contain `items`, `totalCount`, `overallCount`, `page`, `pageSize`,
  and `totalPages`. `totalCount` counts scoped records after optional filters;
  `overallCount` counts the same authorized, live scope before optional filters.
  Without filters the counts are equal. Neither may reveal another user's scope.
- `totalPages = max(1, ceil(totalCount / pageSize))`, retaining existing empty-state
  semantics. A valid page beyond the end returns empty items and accurate metadata;
  do not silently change the requested page.
- Normalize in the shared service, apply filters before database pagination, and
  always end ordering in a unique key (normally `id`). Never load all rows and
  slice them to implement a public list query. Read counts and rows in a short
  `RepeatableRead` transaction so a response describes one database snapshot.
- Clients pass page and size explicitly and request metadata. Reset the page when
  changing collection, filters, or sort; derive next-page availability from the
  returned page and totalPages. Regenerate schema-derived operation types together.
- Editors currently require the complete ordered stage sequence for reordering,
  review, and mutation placement. Their adapters may explicitly traverse pages,
  requesting only stage data after the first page. They must stop using returned
  metadata, handle empty pages, and fail visibly if the supported page bound is
  exhausted rather than return a partial editor state. This does not promise a
  snapshot across requests or bound the editor's total memory use.

### Scope and guards

Independently browsable root collections follow this contract regardless of their
method name. Nested value collections (answer options), mutation results, and
complete realtime party snapshots are aggregate data, not independent list
queries. Internal reads used to reorder stages, compute standings, construct
runtime stages, or hydrate IDs from an already bounded page must preserve their
complete semantics. The persistence guard records those exact methods with
reasons and rejects stale exceptions; it does not exempt an entire directory.

Both lint pipelines run the shared pagination checker. It inspects resolver types
and input inheritance, database list arguments and ordering, and frontend GraphQL
operations against the schema. Regression tests cover the shared limits, page
boundaries, counts, authorization, traversal, and guard rejection cases. Static
checks cannot prove SQL filter equivalence or cross-request consistency; repository
integration tests and review remain necessary.

## Consequences

### Positive

- One discoverable contract and reusable implementation for all current list APIs.
- Bounded database pages, predictable ordering, and coherent response metadata.
- Automated rejection of unpaginated additions and stale exemptions.

### Negative

- Quiz, prediction, and history schema changes require coordinated frontend/backend
  rollout; existing clients of their old signatures must migrate.
- Exact counts, repeatable-read snapshots, and deep offsets have costs. Page bounds
  limit but do not eliminate those costs. Index selection must follow measured
  query plans and representative workloads, not guessed indexes for every sort.
- Separate requests can repeat or miss rows under concurrent insertion, deletion,
  or reordering, even with deterministic ordering and per-response snapshots.

### Follow-Up

- Implementation and maintenance guidance: [backend development](../../development/backend/index.md)
  and [frontend development](../../development/frontend/index.md).
- Before introducing a large feed or increasing the page ceiling, measure latency
  and query plans and propose cursor pagination in a superseding ADR. A cursor
  design must include scope/filter binding, unique order, limits, and indexes.

## References

Reviewed 2026-09-10:

- [GraphQL pagination guidance](https://graphql.org/learn/pagination/): explains
  connection envelopes and the consistency advantages of opaque cursors.
- [Prisma 7 pagination](https://www.prisma.io/docs/orm/v7/prisma-client/queries/pagination):
  offset suits numbered navigation; cursor traversal suits larger sequential lists.
- [PostgreSQL LIMIT/OFFSET](https://www.postgresql.org/docs/current/queries-limit.html):
  pagination requires unique ordering; skipped rows still cost work.
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html):
  repeatable read keeps successive reads on one snapshot within a transaction.
