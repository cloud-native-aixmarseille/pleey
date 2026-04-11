# Frontend Reference

`application/frontend/` — React 19, Vite 7, Inversify DI, Mantine 8, Apollo Client.

## Directory Structure

```text
src/
  domains/          → entities, ports (interfaces), services, errors, value objects
  application/      → use-cases, facades, gateways, contracts (service IDs)
  infrastructure/   → adapters (GraphQL, routing, storage, i18n, UI, forms)
  presentation/     → screens, hooks, routes, shared UI library
  app/              → DI container, providers, routing, bootstrap
  i18n/             → i18n config
  test-utils/       → render-with-providers, factories
```

## DI System (Inversify)

Central to the architecture. Replaces prop-drilling and ad-hoc singletons.

### Service Identifiers

Defined in `application/*/contracts/`:

```ts
export const AUTH_SERVICE_ID = {
  authRepository: Symbol.for("AuthRepository"),
  loginUseCase: Symbol.for("LoginUserUseCase"),
};
```

### Container Modules

Located in `app/composition/container-modules/`. Each module binds ports → adapters and registers use-cases:

```ts
bind<AuthRepository>(AUTH_SERVICE_ID.authRepository).to(GraphqlAuthRepository);
bind<LoginUserUseCase>(AUTH_SERVICE_ID.loginUseCase).to(LoginUserUseCase);
```

### React Bridge

`RuntimeDependencyProvider` wraps the Inversify container in React context. Presentation code accesses services via:

```ts
const loginUseCase = useRuntimeDependency<LoginUserUseCase>(
  AUTH_SERVICE_ID.loginUseCase,
);
```

## Use-Case Pattern

`@injectable()` class with single `execute()` method. Ports injected via `@inject(SYMBOL)`:

```ts
@injectable()
export class LoginUserUseCase {
  constructor(@inject(AUTH_SERVICE_ID.authRepository) private readonly authRepository: AuthRepository) {}
  execute(command: LoginUserCommand): Promise<AuthSession> { ... }
}
```

## Facade Pattern

Facades in `application/*/facades/` aggregate multiple use-cases for coarse-grained operations (e.g., `DashboardWorkspaceFacade` combines ~7 use-cases). Exposed via a gateway interface contract.

## Framework Abstractions

All third-party UI/routing/form/i18n frameworks are hidden behind port interfaces in `application/shared/contracts/`:

| Port              | Adapter                          | Library              |
| ----------------- | -------------------------------- | -------------------- |
| `RoutingPort`     | `ReactRouterRoutingAdapter`      | react-router-dom     |
| `UiPort`          | `MantineUiAdapter`               | @mantine/\*          |
| `FormPort`        | `TanstackFormAdapter`            | @tanstack/react-form |
| `TranslationPort` | `ReactI18nextTranslationAdapter` | react-i18next        |

Presentation components never import framework libraries directly.

## Presentation Layer

### Screens

Plain React function components. Use presentation hooks only:

- `usePresentationTranslation()` — i18n
- `usePresentationForm()` — forms
- `usePresentationNavigate()` — navigation
- `useAuth()` — auth context
- Components from `presentation/shared/ui/*` — never direct Mantine

### UI Component Library

Full design system in `presentation/shared/ui/` organized by category:

```text
ui/
  actions/    → buttons, action icons
  branding/   → logos, brand elements
  data/       → tables, lists, cards
  feedback/   → alerts, notifications, loaders
  forms/      → inputs, selects, checkboxes
  foundation/ → text, title, container
  icons/      → icon wrappers
  layout/     → grid, stack, flex
  navigation/ → links, breadcrumbs, tabs
  overlay/    → modals, drawers
  patience/   → skeletons, spinners
```

### Routing

Decentralized `RouteFactory` pattern:

1. Each feature defines a `RouteFactory` class returning `PresentationRouteObject[]`
2. Factories bound in DI modules via `bind<RouteFactory>(ROUTE_FACTORY).to(...)`
3. `RouteRegistry` collects all via `@multiInject(ROUTE_FACTORY)` and merges into route tree
4. `AppRouter` calls `RouteRegistry.getRoutes()` to build `BrowserRouter`

### i18n

Per-feature translation namespaces in `presentation/<feature>/i18n/`. Feature-specific keys stay in feature scope — no cross-feature key reads.

## Bootstrap

`main.tsx` → `AppRenderer.render()` → `<AppProviders><AppRouter /></AppProviders>`

Provider stack (outermost first):

1. `StrictMode`
2. `Suspense`
3. `PresentationUiProvider` (Mantine)
4. `PresentationTranslationProvider` (i18next)
5. `PresentationRoutingProvider` (react-router)
6. `RuntimeDependencyProvider` (Inversify container)
7. `PresentationFormProvider` (TanStack Form)
8. `AppAuthProvider`

## GraphQL

### Codegen

Schema source: `../backend/src/schema.gql`. Operations defined as `.graphql` files in `infrastructure/**/graphql/operations/`. Output: `infrastructure/graphql/generated/graphql.ts` (typed document nodes).

### Client

`GraphqlClient` wrapper around Apollo Client in `infrastructure/graphql/client/`. Used by infrastructure adapters, never by application or presentation.

## Key Biome Boundaries

Biome enforcement is split between built-in `noRestrictedImports` rules and app-local GritQL plugins under `application/frontend/biome/plugins/` for relative-path architecture checks.

| Scope                          | Restriction                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `domains/**`, `application/**` | No `infrastructure`, `presentation` imports                                                            |
| `presentation/**`              | No `infrastructure`, `app`, no direct `react-router-dom`, `@mantine/*`, `@tanstack/*`, `react-i18next` |
| `presentation/**/routes/**`    | Exempted: can wire application services                                                                |
| `game domain`                  | Cannot import quiz/prediction-specific modules                                                         |
| Host/player slices             | Cannot cross-import                                                                                    |

## Testing

Vitest + Testing Library. Colocateed specs (`*.spec.ts`/`*.spec.tsx`). Screens wrapped in `MantineProvider` + relevant context providers. Route specs mock exact import paths of contexts.
