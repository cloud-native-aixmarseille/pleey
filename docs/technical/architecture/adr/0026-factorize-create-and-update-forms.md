# ADR 0026: Factorize create and update forms

- Status: Accepted
- Proposed date: 2026-11-20
- Accepted date: 2026-11-20
- Issue: [#506](https://github.com/cloud-native-aixmarseille/pleey/issues/506)
- Implementation plan: [docs/technical/plans/0026](../../plans/0026-factorize-create-and-update-forms.md)
- Implementation: [PR #588](https://github.com/cloud-native-aixmarseille/pleey/pull/588)

## Context

Pleey has resource management flows that expose the same editable fields for
creation and update. Keeping separate form components and state hooks for these
flows duplicates field rendering, initialization, reset behavior, validation,
submission handling and user feedback. The create and update variants can then
drift even when the resource contract changes once.

The variants still have meaningful differences. Creation starts from empty or
default values, while update starts from an existing resource. They may use
different commands, success messages, permissions, launch controls and API
failures. These differences must not turn a shared form into a generic workflow
engine or hide application-specific mutation behavior.

Project management already uses one mode-aware dialog. Organization management
uses parallel create and edit implementations. The repository needs one explicit
rule for when and how create and update form surfaces are factorized.

## Decision Drivers

- Create and update flows must render and validate the same resource fields from
  one maintained definition.
- Creation and update commands must retain their distinct types and ownership.
- Initialization, reset, close and error behavior must remain predictable.
- Feature-specific permissions, copy and launch controls must remain visible at
  their call sites.
- The form abstraction must preserve the presentation boundary and the existing
  `FormPort` abstraction.
- Avoid a cross-feature generic form framework that obscures resource contracts.

## Considered Options

### Option 1: Keep separate create and update forms

Maintain independent components and state hooks. This makes each workflow easy
to inspect, but duplicates the shared field surface and allows behavior to drift.

### Option 2: Build a generic create/update form framework

Introduce a reusable framework that accepts fields, schemas, mutations and
messages for all resources. This maximizes reuse in theory, but adds indirection
and broad configuration before multiple concrete forms demonstrate the same
needs.

### Option 3: Share one feature-local form implementation

For a resource whose create and update fields overlap, use one resource-specific
form component and state hook. The shared implementation accepts normalized
initial values and submits normalized form values. Thin create and update
orchestrators own command construction, mutations, permissions and success
notifications.

## Decision

Choose option 3.

Create and update variants of the same resource share one feature-local form
implementation when their editable field set, validation and interaction model
are the same. The shared form owns field state, initialization, reset, validation
and rendering. It accepts a normalized form-values contract rather than a create
or update command contract.

Creation and update wrappers remain responsible for:

- deriving initial form values from defaults or an existing resource;
- mapping submitted values to the appropriate create or update command;
- executing the feature's mutation;
- applying mode-specific permissions, launch controls, success messages and
  failure mappings;
- closing or resetting the form after the mutation result.

Mode-specific presentation copy may be selected inside the resource form with an
explicit discriminated mode. Resource-specific field components and shared UI
primitives remain reusable, but no cross-feature form schema, command factory or
mutation abstraction is introduced solely to remove duplicated branches.

The first migration target is organization management, whose create and edit
forms currently duplicate the same fields and state transitions. Project
management is the reference pattern for a mode-aware form surface.

## Consequences

### Positive

- A resource field is added or changed once for both create and update flows.
- Initialization, validation, reset and error presentation cannot silently
  diverge between variants.
- Create and update command types and mutation behavior remain strongly typed
  and explicit.
- Refactoring stays within the owning feature instead of creating a global UI
  framework.

### Negative

- A shared form has more explicit mode and initialization contracts than either
  isolated form.
- Changes to genuinely different create or update behavior require careful mode
  handling or a split at the wrapper boundary.
- A large feature-local form may still need later decomposition into field
  groups, without making those groups generic across features.

### Follow-Up

- Migrate organization create and update management to one shared form
  implementation with feature-local create and update wrappers.
- Add focused tests for default initialization, existing-value initialization,
  reset, successful submission and mode-specific feedback.
- Apply this rule to later resource forms only when the create and update field
  sets and interaction model are demonstrably equivalent.
