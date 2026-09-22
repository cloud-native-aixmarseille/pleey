# Frontend Standards and Pagination

## Console Usage

`console.*` is forbidden in committed frontend runtime code. Use translated UI notifications, domain error flows, or telemetry instead. `console.*` is allowed in test helpers.

## Framework API Currency

- Treat TypeScript `@deprecated` diagnostics, editor deprecation warnings, and official library release notes as blockers for new frontend code.
- Use the current documented React, Vite, Apollo, Mantine, Zod, and related package APIs directly instead of deprecated helpers or compatibility aliases.
- When a library documents a newer recommended component, hook, config key, or validation shape, prefer that form during edits.

## Performance

- Use code splitting and lazy loading for route-level components.
- Use `useMemo` and `useCallback` only when profiling shows a need.
- Colocate GraphQL queries with their consumers and avoid over-fetching fields.
- Prefer single queries over multiple parallel requests for the same view.
- Keep state close to where it is used and lift it only when shared.

## List Query Pagination

Follow [ADR 0011](../../architecture/adr/0011-standardize-list-query-pagination.md) for list inputs, envelopes, empty pages, and navigation. Reuse domain `PaginationQuery` and `PaginatedResult<T>`, send page and pageSize explicitly, and select the shared metadata. Reset pagination when the collection, filters, or sort change. Do not infer completion from item count alone or silently discard later pages.

`npm run _lint:pagination` validates GraphQL list operations against the backend schema during every lint mode. After API changes, run `npm run graphql:codegen`, then typecheck and test the consumer's empty, final, and multi-page behavior.
