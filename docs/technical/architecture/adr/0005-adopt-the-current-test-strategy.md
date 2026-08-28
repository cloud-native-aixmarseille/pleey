# ADR 0005: Adopt the current test strategy

- Status: Accepted
- Proposed date: 2025-11-17
- Accepted date: 2025-11-17

## Context

Pleey needs confidence across domain logic, application orchestration, UI screens, GraphQL flows, realtime behavior, and end-to-end product journeys.

The repository already uses a layered testing approach with shared conventions.

## Decision Drivers

- fast feedback for most code changes
- good coverage at domain, application, infrastructure, and presentation levels
- deterministic tests for core product logic
- end-to-end validation of critical user journeys
- one consistent testing vocabulary across frontend and backend

## Considered Options

### Option 1: Rely mainly on end-to-end tests

Favor browser or integrated tests over extensive unit and component coverage.

### Option 2: Use a layered strategy with fast unit tests, targeted integration tests, and end-to-end coverage

Use fast local tests by default, then add deeper tests where boundary confidence is required.

## Decision

Choose option 2.

Adopt the current test strategy as the baseline:

- Vitest for backend and frontend test execution
- frontend component and screen tests with Testing Library patterns
- Playwright for end-to-end scenarios
- colocated unit tests near source files
- targeted integration tests in dedicated integration locations
- Arrange-Act-Assert as the standard test structure

## Consequences

### Positive

- most regressions are caught quickly without waiting for full end-to-end suites
- tests align with architectural layers and public interfaces
- contributors have a consistent mental model across the repository

### Negative

- maintaining multiple test layers requires discipline and tooling support
- duplicated coverage can creep in if test scope is not reviewed carefully
- realtime behavior still requires deliberate integration and end-to-end coverage beyond simple unit tests

### Follow-Up

- keep repository test rules and examples aligned with the strategy
- record major testing model changes through ADRs
