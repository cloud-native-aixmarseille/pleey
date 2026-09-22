# Backend Standards and Pagination

## Framework API Currency

- Treat TypeScript `@deprecated` diagnostics, editor deprecation warnings, and official release notes as blockers for new backend code.
- Use the current documented NestJS, Prisma, Zod, GraphQL, and related package APIs directly instead of older compatibility syntax.
- When transport validation or framework integration offers a newer recommended API shape, prefer that form in new code and refactors.

## Performance

- Optimize Prisma queries: select only needed fields, avoid N+1, use `include` judiciously.
- Use caching where appropriate (Redis/Valkey) instead of repeatedly hitting the database for rarely changing data.
- Keep resolvers thin and delegate to use-cases.
- Use DataLoader-style batching when resolving nested GraphQL fields.
- Avoid blocking the event loop; offload heavy computation when needed.

## List Query Pagination

[ADR 0011](../../architecture/adr/0011-standardize-list-query-pagination.md) defines the mandatory contract, bounds, count semantics, isolation, and narrowly scoped internal aggregate exceptions. Follow it for every independently browsable collection.

Use `PaginationInput`, `Paginated(ItemType)`, `PaginatedResult<T>`, and `PaginationQueryNormalizer`. Keep authorization in the use-case and scoped `where`, unique ordering, `skip`, `take`, and counts in the repository. Do not implement a new envelope or duplicate normalization.

`npm run _lint:pagination` runs in all lint modes. The shared checker inspects resolver contracts and repository reads; internal complete reads require an exact method exception with a reason in the checker. Add regression coverage for page boundaries, filtered and authorized counts, tied sort values, and invalid input. Regenerate `src/schema.gql` and frontend operations and types together when changing a list API.
