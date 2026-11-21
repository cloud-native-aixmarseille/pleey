# Production dependency version matrix

| Component                 | Exact version or digest                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| Node.js                   | 26.13.1                                                                                              |
| pnpm                      | 10.32.1                                                                                              |
| TypeScript                | 6.0.3                                                                                                |
| NestJS                    | 12.5.1                                                                                               |
| Prisma CLI/client/adapter | 7.10.1                                                                                               |
| PostgreSQL                | 16-alpine                                                                                            |
| Valkey                    | 8-alpine                                                                                             |
| SeaweedFS                 | 4.47                                                                                                 |
| API web image base        | `node:26.13.1-bookworm-slim@sha256:add5c17c14752c54d2f3d519ec46a3815684d41c33f198bcb09fb998f7dcbf68` |
| Web image                 | `nginx:1.31-alpine@sha256:713fc2ebfd92e8217db451477182ee91944b123d2b1ee9fd5a8c6e91ca6c3a11`          |

Production images and the HTTPS proxy must be selected by immutable OCI digest. Mutable tags are not valid promotion identifiers. The current release manifest records candidate API/web digests and the chart checksum.
