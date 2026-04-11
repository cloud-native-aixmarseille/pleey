# Backend Reference

`application/backend/` — NestJS 11, GraphQL code-first, Prisma 7, PostgreSQL.

## Directory Structure

```text
src/
  domain/           → entities, ports (interface + Symbol), enums, value objects, errors
  application/      → use-cases, DTOs, application ports, services
  infrastructure/   → Prisma adapters, JWT strategy, telemetry, health
  presentation/     → GraphQL resolvers, HTTP controllers, guards, error handling
  app/              → NestJS modules, config, bootstrap (main.ts)
  i18n/             → translation JSON files
  test-utils/       → shared test helpers
```

## Use-Case Pattern

Single-responsibility `@Injectable()` class with one `execute()` method. Injected ports via `@Inject(SYMBOL_TOKEN)`. Throws plain `Error(ErrorCode.ENUM_VALUE)` — never NestJS exceptions.

```ts
@Injectable()
export class CreatePartyUseCase {
  constructor(
    @Inject(PartyManagementPort)
    private readonly partyManagement: PartyManagementPort,
  ) {}

  async execute(command: CreatePartyCommand): Promise<PartyDto> {
    // ...
    throw new Error(GameErrorCode.GAME_NOT_FOUND);
  }
}
```

## Port Definitions

Two styles:

1. **Interface + Symbol** (domain ports):

   ```ts
   export interface UserRepository {
     findById(id: UserId): Promise<User | null>;
   }
   export const UserRepositoryProvider = Symbol("UserRepository");
   ```

2. **Abstract class as token** (application ports):
   ```ts
   export abstract class GameCatalogPort { abstract listGames(...): Promise<...>; }
   ```

## Infrastructure Adapters

Prisma-based implementations. Naming: `Prisma<Entity><Port>Adapter`.

Bound in `app/modules/`:

```ts
{ provide: UserRepositoryProvider, useExisting: PrismaUserRepository }
```

## Presentation Layer

### GraphQL (primary)

Code-first via `@nestjs/graphql`. Resolvers are `@Resolver()` classes with `@Query()` / `@Mutation()` methods. Auth via `@UseGuards(GqlJwtAuthGuard)`.

### HTTP (secondary)

Used for identity endpoints (login, register, refresh). Standard NestJS controllers.

### Error Handling

Chain-of-responsibility pattern:

1. Use-case throws `Error(errorCode)`
2. `I18nHttpExceptionFilter` catches it
3. `ErrorCodeHttpStatusService` resolves HTTP status (delegates to per-domain resolvers)
4. `ErrorTranslationService` resolves i18n message key
5. Response sent with status + localized message

Per-domain resolvers and translators live in `presentation/<domain>/shared/error-handling/`.

## Module Composition

Each feature has a NestJS module in `app/modules/<domain>/`:

1. Imports infrastructure dependencies (`DatabaseModule`)
2. Registers adapters, use-cases, resolvers as providers
3. Binds ports → adapters
4. Exports services for cross-module consumption

Root `AppModule` imports all feature modules + `GraphQLModule` (Apollo, code-first, auto-schema) + `I18nModule`.

## Config & Env

- `process.env` reads restricted to `src/app/config/` (enforced by Biome `noProcessEnv`)
- `AppEnvironment` reads raw env vars
- `AppConfiguration` wraps into typed config objects
- Distributed via NestJS DI tokens: `APP_SERVER_CONFIG`, `GAME_SOCKET_CORS_OPTIONS`, etc.

## Bootstrap (`main.ts`)

1. Init OpenTelemetry (before any other import)
2. Create NestJS app with custom logger
3. Configure CORS, WebSocket adapter, global `ValidationPipe`, global exception filter
4. Start listening

## Key Biome Boundaries

Biome enforcement is split between built-in `noRestrictedImports` rules and app-local GritQL plugins under `application/backend/biome/plugins/` for relative-path architecture checks.

| Scope              | Restriction                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `domain/**`        | No `infrastructure`, `presentation`, `app`, no NestJS `Exception` |
| `application/**`   | No `infrastructure`, `presentation`, `app`, no NestJS `Exception` |
| `use-cases/**`     | No NestJS `Exception` classes                                     |
| `presentation/**`  | No `app` layer imports                                            |
| Host/player slices | Cannot cross-import each other                                    |

## Testing

Vitest. Unit tests colocateed with source (`*.spec.ts`). Integration tests in `test/`. Pattern: arrange-act-assert with `rejects.toThrow(ERROR_CODE)` for error cases.
