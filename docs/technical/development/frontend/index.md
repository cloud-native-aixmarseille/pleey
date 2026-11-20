# Frontend Development

`apps/web/` - React 19, Vite 7, Inversify, Vitest.

This reference documents the current approved frontend state only. Update it in the same change as any frontend behavior, contract, tooling, or UI pattern change. Do not preserve superseded, transitional, or compatibility guidance here.

## Sections

- [Tooling and testing](./tooling-and-testing.md)
- [Application patterns](./application-patterns.md)
- [Standards and pagination](./standards.md)

## Shared domain package

Follow the canonical [shared domain package workflow](../index.md#shared-domain-package)
for `@pleey/contracts` extraction and validation. Import shared contracts directly
from their feature entry point and map generated GraphQL or Socket.IO values at
the infrastructure boundary. Shared frontend types describe public data; they
must not bypass authenticated access, signed media renewal or server-produced
permission decisions.

## Resource permissions

Use [ADR 0014](../../architecture/adr/0014-unify-resource-scoped-permissions.md)
for server decisions, localized disabled-action reasons, and access refresh.

## End user documentation

See [guide authoring, generation and validation](./user-guides.md).
