# @pleey/contracts

Private repository package for frontend/backend shared domain contracts and
framework-neutral policies.

Follow the [shared domain package workflow](../../docs/technical/development/index.md#shared-domain-package)
for eligibility, boundaries, adapters and validation commands. Architectural
scope and consequences are defined by
[ADR 0022](../../docs/technical/architecture/adr/0022-evaluate-a-shared-frontend-backend-library.md).

Consumers import explicit feature entry points. This package has no catch-all
runtime export and must not depend on either application or on framework,
transport, persistence, browser-only or Node-only APIs.
Its source is TypeScript-only and must use erasable syntax supported directly by
the repository's Node runtime without package-specific compilation.

The `i18n` entry point contains only localized messages for exported public
business error codes. Screen, accessibility, email and application-local error
copy stay in their application catalogs.
