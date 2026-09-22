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

Resolvers, controllers, and gateways stay thin. Orchestration belongs in use-cases and application services behind ports.

## Error Handling

Use-cases and runtime services throw domain errors, and `I18nHttpExceptionFilter` translates them to HTTP status and localized messages.

- Prefer dedicated domain error classes such as `new PredictionNotFoundError({ predictionId })`.
- Use `createDomainError(definition, context)` only when a dedicated class would add no value.
- Always include a non-empty context payload with the best local identifiers or validation facts available.
- Domain error classes and error modules must live under `src/domain/**`, not under application, infrastructure, or presentation folders.
- Do not throw bare `Error` from backend runtime layers under `src/application/`, `src/domain/`, `src/infrastructure/`, or `src/presentation/`.

## Runtime Config

Read `process.env` only in `src/app/config/`. Runtime code receives config via DI tokens such as `APP_SERVER_CONFIG` and `GAME_SOCKET_CORS_OPTIONS`.
