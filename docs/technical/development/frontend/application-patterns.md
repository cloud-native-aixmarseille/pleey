# Frontend Application Patterns

## Writing Use-Cases

Use an `@injectable()` class with a single `execute()` method and ports injected through `@inject(SYMBOL)`:

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

Use plain React function components and presentation hooks only:

- `usePresentationTranslation()`
- `usePresentationForm()`
- `usePresentationNavigate()`
- `useAuth()`
- Components from `presentation/shared/ui/*`

```typescript
export const SignInScreen = () => {
  const { t } = usePresentationTranslation('identity');
  return <PresentationTitle>{t('signIn.title')}</PresentationTitle>;
};
```

## Component Organization

- `presentation/<feature>/components/` is for feature components reused across screens, including screens in other scopes. The presentation folder guard accepts these directories directly below a top-level feature, as well as component directories under `shared/` and `screens/`.
- Screen-local components go in `presentation/<scope>/screens/<feature>/components/`.
- Split large components so each has one reason to change.
- Keep component props strictly necessary; if every usage passes the same value, factor that invariant into the component or split the component.

## Styling

- Do not hardcode styles, inline `style`, or custom `className` in presentation components.
- Use shared UI components from `presentation/shared/ui/*`.
- Shared UI components use Mantine internally and rely on theme tokens; avoid custom CSS for those surfaces.

## DI in Presentation

Access services via `useRuntimeDependency()`:

```typescript
const loginUseCase = useRuntimeDependency<LoginUserUseCase>(
  AUTH_SERVICE_ID.loginUseCase,
);
```

Do not instantiate services with `new` in presentation code.

## Error Handling

- Throw domain errors or `createDomainError(definition, context)` from frontend runtime code instead of bare `Error`.
- Always include a non-empty context object with relevant local facts, such as `operationName`, `projectId`, `fileName`, `consumer`, or `contextName`.
- Domain error classes and error modules must live under `src/domains/**`, not under application, infrastructure, or presentation folders.
- Provider and runtime-guard errors should identify the missing boundary explicitly, for example `{ consumer: 'useAuth', contextName: 'AuthContext' }`.

## Routing

Each feature defines a `RouteFactory` class returning `PresentationRouteObject[]`. Bind it in DI and collect it with `RouteRegistry` via `@multiInject(ROUTE_FACTORY)`.

## Framework Abstractions

Hide third-party libraries behind port interfaces in `application/shared/ports/` such as `RoutingPort`, `UiPort`, `FormPort`, and `TranslationPort`. Infrastructure adapters provide concrete implementations. Presentation code does not import framework libraries directly.

## Identity CAPTCHA

Signup, recovery-email requests, and the signed-in security recovery action use the shared identity CAPTCHA integration from [ADR 0009](../../architecture/adr/0009-harden-identity-recovery-and-sessions.md). The infrastructure adapter bundles Cap's widget and WebAssembly assets locally and supplies the configured backend API endpoint through the application port.

The form requires a verified token before submission and discards it after an attempt, expiry, or widget failure. English and French resources provide widget labels and failure feedback. The token-bearing password replacement form does not request a new CAPTCHA.

## Scoped event themes

Theme feature components, hooks, and translations live in `presentation/theme/`. Follow the ownership boundary with the shared design system defined in ADR 0012 below.

[ADR 0012](../../architecture/adr/0012-manage-themes-as-data-driven-token-themes.md#authoring-and-assets-implementation) defines inherited theme selections, documents, authoring, and rollout ordering. Theme selection types live in `domains/theme/entities/theme-id.ts`; `ThemeIdentifier` belongs to `application/workspace/themes/services/` and is registered in the workspace container. Management forms edit `defaultThemeId`, while realtime payloads carry the required resolved `themeDocument`. Party screens apply that document through `usePartyTheme`; color scheme stays independent and theme seeds remain in the UI foundation.
