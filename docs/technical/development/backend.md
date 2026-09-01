# Backend Development

`application/backend/` — NestJS 12, TypeScript, Vitest.

## Commands

See `package.json` scripts and `make help` for available commands.

Lint pipeline runs targeted custom scripts before and after Biome, including
naming, DI-instantiation, domain-error-context, and invariant-argument checks.
Domain-error throw shape is enforced in Biome via a shared GritQL plugin, while
the custom checker is kept for alias-based empty-context cases that the plugin
cannot resolve. Milestone-0 legacy-path boundaries are enforced in `biome.json`
via app-local GritQL plugins alongside `noRestrictedImports` overrides.

## Testing Conventions

Unit tests colocateed with source (`*.spec.ts`). Integration tests in `test/`.

Pattern: arrange-act-assert. Error assertions via `rejects.toThrow(ERROR_CODE)` — single call, don't execute logic twice.

## Writing Use-Cases

`@Injectable()` class, single `execute()` method, injected ports via `@Inject(SYMBOL_TOKEN)`:

```typescript
@Injectable()
export class CreatePartyUseCase {
  constructor(
    @Inject(PartyManagementPort)
    private readonly partyManagement: PartyManagementPort,
  ) {}

  async execute(command: CreatePartyCommand): Promise<PartyDto> {
    // throw new GameNotFoundError({ gameId: command.gameId }) on failure — never HttpException
  }
}
```

## Writing Ports

Two styles:

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

Error handling is automatic — use-cases and runtime services throw domain errors, and `I18nHttpExceptionFilter` translates them to HTTP status + i18n message.

- Prefer dedicated domain error classes such as `new PredictionNotFoundError({ predictionId })`.
- Use `createDomainError(definition, context)` only when a dedicated class would add no value.
- Always include a non-empty context payload with the best local identifiers or validation facts available.
- Domain error classes and error modules must live under `src/domain/**`, not under application, infrastructure, or presentation folders.
- Do not throw bare `Error` from backend runtime layers under `src/application/`, `src/domain/`, `src/infrastructure/`, or `src/presentation/`.

## Config

`process.env` reads only in `src/app/config/`. Runtime code receives config via DI tokens (`APP_SERVER_CONFIG`, `GAME_SOCKET_CORS_OPTIONS`, etc.).

## Framework API Currency

- Treat TypeScript `@deprecated` diagnostics, editor deprecation warnings, and official framework migration notes as blockers for new backend code.
- Use the current documented NestJS, Prisma, Zod, GraphQL, and related package APIs directly instead of older compatibility syntax kept only for migration tolerance.
- When transport validation or framework integration offers a newer recommended API shape, prefer that form in new code and refactors rather than preserving deprecated helpers for a smaller diff.

## Performance

- Optimize Prisma queries: select only needed fields, avoid N+1, use `include` judiciously
- Use caching where appropriate (Redis/Valkey) — don't hit the DB for data that rarely changes
- Keep resolvers thin — delegate to use-cases, don't orchestrate in resolvers
- Use DataLoader pattern for batching when resolving nested GraphQL fields
- Avoid blocking the event loop — offload heavy computation if needed
