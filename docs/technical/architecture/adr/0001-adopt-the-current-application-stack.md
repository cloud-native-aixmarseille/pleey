# ADR 0001: Adopt the current application stack

- Status: Accepted
- Proposed date: 2025-11-17
- Accepted date: 2025-11-17

## Context

Pleey is a realtime multiplayer platform with a backend, a browser frontend, shared tooling, end-to-end tests, and deployment assets in the same repository.

The project needs:

- one primary language across the product surface
- fast iteration across frontend and backend
- strong typing across API and application boundaries
- mainstream frameworks with solid ecosystem support
- a stack that supports realtime gameplay, GraphQL, typed persistence, and containerized delivery

The current codebase already implements a coherent stack around TypeScript.

## Decision Drivers

- end-to-end type safety
- team productivity in a single-language codebase
- support for GraphQL and realtime multiplayer needs
- mature library ecosystems
- maintainability in a monorepo

## Considered Options

### Option 1: Use a TypeScript-first full-stack monorepo

Use TypeScript across backend, frontend, tooling, and tests, with modern frameworks selected per runtime concern.

### Option 2: Split the system across multiple languages or repositories

Use different languages or separate repositories for backend, frontend, and tooling.

## Decision

Choose option 1.

Adopt and document the current stack as the baseline platform choice:

- monorepo repository structure
- TypeScript as the primary language
- backend: NestJS, GraphQL, Prisma, PostgreSQL, Socket.IO, OpenTelemetry
- frontend: React, Vite, Apollo Client, Inversify, Mantine, TanStack Form, react-router
- tests: Vitest and Playwright
- linting and formatting: Biome
- local and deployment packaging via Docker and Helm assets already present in the repository

## Consequences

### Positive

- consistent language and tooling across the product
- easier type sharing and API alignment between frontend and backend
- lower context switching for contributors
- mainstream frameworks with large documentation and extension ecosystems

### Negative

- the stack becomes opinionated and less flexible for isolated subprojects
- framework upgrades require coordinated repository-wide work
- TypeScript toolchain performance and complexity affect most of the repository at once

### Follow-Up

- keep architecture and development docs aligned with the actual stack
- record major stack changes through new or superseding ADRs
