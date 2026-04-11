# Frontend Development

`application/frontend/` — React 19, Vite 7, Inversify, Vitest.

## Commands

See `package.json` scripts and `make help` for available commands.

### GraphQL Codegen

Schema source: `../backend/src/schema.gql`. Operations: `.graphql` files in `src/infrastructure/**/graphql/operations/`. Output: `src/infrastructure/graphql/generated/graphql.ts`. Run via `npm run graphql:codegen` or `make graphql-types`.

### Lint Pipeline

Custom scripts run before Biome: `check-naming.mjs`, `check-presentation-screens.mjs`,
`check-di-instantiation.mjs`, `check-game-refactor-boundaries.mjs`.
Architectural boundaries are enforced primarily via `biome.json`
`noRestrictedImports` overrides and shared Biome plugins;
`check-game-refactor-boundaries.mjs` remains as a milestone-0 legacy-path guard,
`check-di-instantiation.mjs` is limited to direct `new` instantiation checks,
and shared-wrapper plus direct `*Service` presentation imports are enforced in Biome.

## Testing Conventions

Unit tests colocateed (`*.spec.ts` / `*.spec.tsx`). Screen tests require `MantineProvider` wrapper. Route specs mock exact import paths of auth/org/game contexts.

## Writing Use-Cases

`@injectable()` class, single `execute()` method, ports via `@inject(SYMBOL)`:

```typescript
@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(AUTH_SERVICE_ID.authRepository) private readonly authRepository: AuthRepository,
  ) {}

  execute(command: LoginUserCommand): Promise<AuthSession> { ... }
}
```

Register in `app/composition/container-modules/`:

```typescript
bind<LoginUserUseCase>(AUTH_SERVICE_ID.loginUseCase).to(LoginUserUseCase);
```

## Writing Facades

Facades aggregate multiple use-cases for coarse-grained operations:

```typescript
@injectable()
export class DashboardWorkspaceFacade implements DashboardWorkspaceGateway {
  constructor(
    @inject(ID.loadGames) private readonly loadGames: LoadProjectGamesUseCase,
    // ...more use-cases
  ) {}

  async loadProjectGameCatalog(projectId: string): Promise<...> { ... }
}
```

## Writing Screens

Plain React function components. Use presentation hooks only — never import framework libs directly:

- `usePresentationTranslation()` — i18n
- `usePresentationForm()` — forms
- `usePresentationNavigate()` — navigation
- `useAuth()` — auth context
- Components from `presentation/shared/ui/*` — never `@mantine/*`

```typescript
export const SignInScreen = () => {
  const { t } = usePresentationTranslation('identity');
  return <PresentationTitle>{t('signIn.title')}</PresentationTitle>;
};
```

### Component Organization

- `presentation/<scope>/components/` is for shared components reused across multiple screens within that scope
- Screen-local components go in `presentation/<scope>/screens/<feature>/components/`
- Split large components following SOLID — a component should have one reason to change

### Styling

- No hardcoded styles, inline `style`, or custom `className` in components
- Use shared UI components from `presentation/shared/ui/*`
- Shared UI components use Mantine internally and rely on theme tokens — no custom CSS

## DI in Presentation

Access services via `useRuntimeDependency()`:

```typescript
const loginUseCase = useRuntimeDependency<LoginUserUseCase>(
  AUTH_SERVICE_ID.loginUseCase,
);
```

Never instantiate services with `new` in presentation code.

## Routing

Each feature defines a `RouteFactory` class returning `PresentationRouteObject[]`. Bound in DI, collected by `RouteRegistry` via `@multiInject(ROUTE_FACTORY)`.

## Framework Abstractions

All third-party libs hidden behind port interfaces in `application/shared/contracts/` (`RoutingPort`, `UiPort`, `FormPort`, `TranslationPort`). Infrastructure adapters provide concrete implementations. Presentation code never imports framework libraries directly — Biome enforces this.

## `console.*` is Forbidden

Use translated UI notifications, domain error flows, or telemetry. `console.*` only allowed in test helpers.

## Performance

- Use code splitting / lazy loading for route-level components
- Memoize expensive computations (`useMemo`) and stable callbacks (`useCallback`) only when profiling shows a need
- Colocate GraphQL queries with their consumers — avoid over-fetching fields
- Prefer single queries over multiple parallel requests for the same view
- Avoid re-renders: keep state close to where it's used, lift only when shared
