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

Resolvers may parse identifiers, extract authentication context, adapt upload streams, and present results with transport helpers. Field resolvers may project already-loaded values directly; fetching additional data requires a use case. The `_lint:resolvers` guard checks these boundaries, including import aliases and reexports. See [ADR 0002](../../architecture/adr/0002-use-clean-architecture-with-strict-boundaries.md).

Controllers and gateways also stay thin; keep their orchestration in application use cases.

### Reading uploads

[ADR 0013](../../architecture/adr/0013-share-graphql-upload-stream-reading.md) defines shared upload handling. Inject `GraphqlUploadReader` from `SharedServicesModule` and supply the feature's byte limit and domain-error factory. Its source exposes metadata and a lazy, single-use `readChunks()` iterator; it bounds bytes and destroys streams on failure or early cancellation.

Keep feature adaptation in the owning presentation reader: theme images buffer bounded binary data only after authorization, while quiz and prediction imports decode UTF-8 and stream lines. Image validation, re-encoding, and persistence stay outside the shared transport reader. Preserve `Promise<GraphqlUploadFile> | GraphqlUploadFile` on standalone GraphQL upload arguments so the global validation pipe does not transform the scalar as a DTO.

Quiz question media also enters through a lazy application upload source. Create/update use cases check current project access and question inputs before `QuizQuestionMediaPreparationService` opens that source. It applies `QuizQuestionMediaPolicy` to MIME metadata before reading content and to the byte count before publication. The quiz adapter delegates stream limits and cleanup to `GraphqlUploadReader`, using the limit supplied by the application. `MediaMutationService` publishes prepared media and compensates failed persistence; see [ADR 0013](../../architecture/adr/0013-share-graphql-upload-stream-reading.md) and [ADR 0016](../../architecture/adr/0016-support-media-on-quiz-questions.md).

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

[ADR 0012](../../architecture/adr/0012-manage-themes-as-data-driven-token-themes.md#authoring-and-assets-implementation) defines the theme document contract, inherited selections, authoring rules, and rollout ordering. Theme selection uses the existing workspace and party authorization paths. Keep theme selection IDs separate from gameplay settings and validate them at transport boundaries.

`CreatePartyUseCase` calls `ThemeSelectionService.resolve`, provided by `ThemeModule`, with workspace defaults and the optional party override. The service owns inheritance and document lookup; callers receive the required theme document directly.

The dedicated management pages use `themePermissions(organizationId)` through `GetThemeAccessUseCase` and `theme(organizationId, themeId)` through `GetThemeUseCase`. The access query requires membership and returns typed `read`, `create`, `update`, and `uploadAsset` action decisions; the single-theme query requires management permission and scopes the lookup to the organization. Existing member-facing pickers continue to use the paginated `listThemes` query, which also exposes collection permissions. See ADR 0014 for policy ownership and denial reasons.

## Resource permissions

Follow [ADR 0014](../../architecture/adr/0014-unify-resource-scoped-permissions.md) for feature policy ownership, application enforcement, safe permission projections, and concurrency guarantees.
