# Backend Development

`application/backend/` — NestJS 11, TypeScript, Vitest.

## Commands

See `package.json` scripts and `make help` for available commands.

Lint pipeline runs custom scripts before Biome: `check-naming.mjs` (export naming), `check-game-refactor-boundaries.mjs` (milestone-0 legacy-path guard). Architectural boundaries are enforced primarily via `biome.json` `noRestrictedImports` overrides and shared Biome plugins.

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
    // throw Error(GameErrorCode.GAME_NOT_FOUND) on failure — never HttpException
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

Error handling is automatic — use-cases throw `Error(errorCode)`, `I18nHttpExceptionFilter` translates to HTTP status + i18n message.

## Config

`process.env` reads only in `src/app/config/`. Runtime code receives config via DI tokens (`APP_SERVER_CONFIG`, `GAME_SOCKET_CORS_OPTIONS`, etc.).

## Performance

- Optimize Prisma queries: select only needed fields, avoid N+1, use `include` judiciously
- Use caching where appropriate (Redis/Valkey) — don't hit the DB for data that rarely changes
- Keep resolvers thin — delegate to use-cases, don't orchestrate in resolvers
- Use DataLoader pattern for batching when resolving nested GraphQL fields
- Avoid blocking the event loop — offload heavy computation if needed
