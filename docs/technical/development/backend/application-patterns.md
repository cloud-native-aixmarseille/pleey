# Backend Application Patterns

## Writing Use-Cases

Use an `@Injectable()` class with a single `execute()` method and injected ports via `@Inject(SYMBOL_TOKEN)`:

```typescript
@Injectable()
export class CreatePartyUseCase {
  constructor(
    @Inject(PartyManagementPort)
    private readonly partyManagement: PartyManagementPort,
  ) {}

  async execute(command: CreatePartyCommand): Promise<PartyDto> {
    // throw new GameNotFoundError({ gameId: command.gameId }) on failure - never HttpException
  }
}
```

## Writing Ports

Two styles are used:

```typescript
// Interface + Symbol (domain ports)
export interface UserRepository { findById(id: UserId): Promise<User | null>; }
export const UserRepositoryProvider = Symbol('UserRepository');

// Abstract class as token (application ports)
export abstract class GameCatalogPort { abstract listGames(...): Promise<...>; }
```

Bind in `app/modules/`:

```typescript
{ provide: UserRepositoryProvider, useExisting: PrismaUserRepository }
```

## Writing Resolvers

GraphQL code-first. Auth via guard:

```typescript
@Resolver()
export class GameManagementResolver {
  @UseGuards(GqlJwtAuthGuard)
  @Query(() => GameListType)
  async listGames(@Context() ctx): Promise<...> { ... }
}
```

Each GraphQL query, mutation, and subscription must delegate application behavior to a use-case `execute()` method. Resolvers must not inject or call repositories, infrastructure adapters, or business services directly. Use cases own authorization, orchestration, and port access; shared business services are dependencies of use cases.

Resolvers may parse identifiers, extract authentication context, adapt upload streams, and present results with transport helpers. Field resolvers may project already-loaded values directly; fetching additional data requires a use case. The `_lint:resolvers` guard checks these boundaries, including import aliases and re-exports. See [ADR 0002](../../architecture/adr/0002-use-clean-architecture-with-strict-boundaries.md).

Controllers and gateways also stay thin; keep their orchestration in application use cases.

## Error Handling

Use-cases and runtime services throw domain errors, and `I18nHttpExceptionFilter` translates them to HTTP status and localized messages.

- Prefer dedicated domain error classes such as `new PredictionNotFoundError({ predictionId })`.
- Use `createDomainError(definition, context)` only when a dedicated class would add no value.
- Always include a non-empty context payload with the best local identifiers or validation facts available.
- Domain error classes and error modules must live under `src/domain/**`, not under application, infrastructure, or presentation folders.
- Do not throw bare `Error` from backend runtime layers under `src/application/`, `src/domain/`, `src/infrastructure/`, or `src/presentation/`.

## Runtime Config

Read `process.env` only in `src/app/config/`. Runtime code receives config via DI tokens such as `APP_SERVER_CONFIG` and `GAME_SOCKET_CORS_OPTIONS`.

## Scoped event themes

[ADR 0012](../../architecture/adr/0012-manage-themes-as-data-driven-token-themes.md#authoring-and-assets-implementation) defines the theme document contract, inherited selections, authoring rules, and rollout ordering. Theme selection uses the existing workspace and party authorization paths. Keep theme selection ids separate from gameplay settings and validate them at transport boundaries.

`CreatePartyUseCase` calls `ThemeSelectionService.resolve`, provided by `ThemeModule`, with workspace defaults and the optional party override. The service owns inheritance and document lookup; callers receive the required theme document directly.
