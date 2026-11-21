# Backend Development

`application/backend/` - NestJS 12, TypeScript, Vitest.

This reference documents the current approved backend state only. Update it in the same change as any backend behavior, contract, tooling, or deployment change. Do not preserve superseded, transitional, or compatibility guidance here.

## Sections

- [Tooling and testing](./tooling-and-testing.md)
- [Application patterns](./application-patterns.md)
- [Operations and recovery delivery](./operations.md)
- [Standards and pagination](./standards.md)

## Shared domain package

Follow the canonical [shared domain package workflow](../index.md#shared-domain-package)
for `@pleey/contracts` extraction and validation. Import shared contracts directly
from their feature entry point. Keep trusted server state, authorization,
persistence, hashing, signing, upload processing and media storage in backend
layers; keep local permission adapters where domain error enums differ from the
public reason vocabulary.
