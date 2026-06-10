import { Module } from '@nestjs/common';
import { GameCatalogPort } from '../../../application/game/management/ports/game-catalog.port';
import { GamePermissionResolver } from '../../../application/game/management/services/game-permission-resolver';
import { ListProjectGamesUseCase } from '../../../application/game/management/use-cases/list-project-games-use-case';
import { HostPartyObservationReaderPort } from '../../../application/game/party/host/ports/host-party-observation-reader.port';
import { HostPartyRuntimeControlPort } from '../../../application/game/party/host/ports/host-party-runtime-control.port';
import { HostPartyRuntimeStageReferenceResolver } from '../../../application/game/party/host/services/host-party-runtime-stage-reference-resolver';
import { AdvanceStageUseCase } from '../../../application/game/party/host/use-cases/advance-stage-use-case';
import { CreatePartyUseCase } from '../../../application/game/party/host/use-cases/create-party-use-case';
import { EndPartyUseCase } from '../../../application/game/party/host/use-cases/end-party-use-case';
import { GetHostPartyObservationUseCase } from '../../../application/game/party/host/use-cases/get-host-party-observation-use-case';
import { KickPartyPlayerUseCase } from '../../../application/game/party/host/use-cases/kick-party-player-use-case';
import { PausePartyUseCase } from '../../../application/game/party/host/use-cases/pause-party-use-case';
import { RestartStageUseCase } from '../../../application/game/party/host/use-cases/restart-stage-use-case';
import { ResumePartyUseCase } from '../../../application/game/party/host/use-cases/resume-party-use-case';
import { RevealStageResultUseCase } from '../../../application/game/party/host/use-cases/reveal-stage-result-use-case';
import { RewindPartyUseCase } from '../../../application/game/party/host/use-cases/rewind-party-use-case';
import { RewindStageUseCase } from '../../../application/game/party/host/use-cases/rewind-stage-use-case';
import { StartPartyUseCase } from '../../../application/game/party/host/use-cases/start-party-use-case';
import { PlayerPartyActionRuntimePort } from '../../../application/game/party/player/ports/player-party-action-runtime.port';
import { PlayerPartyObservationReaderPort } from '../../../application/game/party/player/ports/player-party-observation-reader.port';
import { PlayerPartyRuntimePort } from '../../../application/game/party/player/ports/player-party-runtime.port';
import { GetPlayerPartyObservationUseCase } from '../../../application/game/party/player/use-cases/get-player-party-observation-use-case';
import { JoinPartyUseCase } from '../../../application/game/party/player/use-cases/join-party-use-case';
import { LeavePartyUseCase } from '../../../application/game/party/player/use-cases/leave-party-use-case';
import { SubmitPartyActionUseCase } from '../../../application/game/party/player/use-cases/submit-party-action-use-case';
import { PartyGameTypeReaderPort } from '../../../application/game/party/shared/ports/party-game-type-reader.port';
import { PartyManagementPort } from '../../../application/game/party/shared/ports/party-management.port';
import { PartyObservationBroadcasterPort } from '../../../application/game/party/shared/ports/party-observation-broadcaster.port';
import { PartyActionIdentifier } from '../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { PartyStageIdentifier } from '../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { BroadcastPartyObservationUseCase } from '../../../application/game/party/shared/use-cases/broadcast-party-observation-use-case';
import { ListPartiesUseCase } from '../../../application/game/party/shared/use-cases/list-parties-use-case';
import { LoadPartyObservationSnapshotUseCase } from '../../../application/game/party/shared/use-cases/load-party-observation-snapshot-use-case';
import { GameIdentifier } from '../../../application/game/shared/services/identifiers/game-identifier';
import { PredictionPartyActionPolicy } from '../../../application/game/types/prediction/services/prediction-party-action-policy';
import { QuizPartyActionPolicy } from '../../../application/game/types/quiz/services/quiz-party-action-policy';
import { GameTypePartyActionPolicyRegistryPort } from '../../../application/game/types/shared/ports/game-type-party-action-policy-registry.port';
import { PartyStageCatalogPort } from '../../../application/game/types/shared/ports/party-stage-catalog.port';
import { PartyStageConfigurationPort } from '../../../application/game/types/shared/ports/party-stage-configuration.port';
import { ChoiceSubmissionPartyActionPolicy } from '../../../application/game/types/shared/services/choice-submission-party-action-policy';
import { GameTypeIdentifier } from '../../../application/game/types/shared/services/game-type-identifier';
import { GameTypeParser } from '../../../application/game/types/shared/services/game-type-parser';
import { GuestIdentifier } from '../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import { HostPartyLifecyclePolicy } from '../../../domain/game/party/host/services/host-party-lifecycle-policy';
import { PartyRuntimeContextProjectionService } from '../../../domain/game/party/shared/services/party-runtime-context-projection.service';
import { GameType } from '../../../domain/game/types/shared/entities/game-type';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { PrismaGameCatalogAdapter } from '../../../infrastructure/game/management/prisma-game-catalog.adapter';
import { PrismaHostPartyObservationReader } from '../../../infrastructure/game/party/prisma-host-party-observation-reader';
import { PrismaHostPartyRuntimeControlAdapter } from '../../../infrastructure/game/party/prisma-host-party-runtime-control.adapter';
import { PrismaPartyGameTypeReader } from '../../../infrastructure/game/party/prisma-party-game-type-reader';
import { PrismaPartyManagementAdapter } from '../../../infrastructure/game/party/prisma-party-management.adapter';
import { PrismaPlayerPartyActionRuntimeAdapter } from '../../../infrastructure/game/party/prisma-player-party-action-runtime.adapter';
import { PrismaPlayerPartyObservationReader } from '../../../infrastructure/game/party/prisma-player-party-observation-reader';
import { PrismaPlayerPartyRuntimeAdapter } from '../../../infrastructure/game/party/prisma-player-party-runtime.adapter';
import { PrismaPartyPlayerRemovalService } from '../../../infrastructure/game/party/services/prisma-party-player-removal.service';
import { PrismaPartyReadModelMapper } from '../../../infrastructure/game/party/services/prisma-party-read-model-mapper';
import { PrismaGameSettingsMapper } from '../../../infrastructure/game/shared/prisma-game-settings.mapper';
import { PredictionPartyStageCatalogEntryResolver } from '../../../infrastructure/game/types/prediction/prediction-party-stage-catalog-entry-resolver';
import { PredictionPartyStageConfigurationResolver } from '../../../infrastructure/game/types/prediction/prediction-party-stage-configuration-resolver';
import { PrismaPartyStageCatalogAdapter } from '../../../infrastructure/game/types/prisma-party-stage-catalog.adapter';
import { PrismaPartyStageConfigurationAdapter } from '../../../infrastructure/game/types/prisma-party-stage-configuration.adapter';
import { QuizPartyStageCatalogEntryResolver } from '../../../infrastructure/game/types/quiz/quiz-party-stage-catalog-entry-resolver';
import { QuizPartyStageConfigurationResolver } from '../../../infrastructure/game/types/quiz/quiz-party-stage-configuration-resolver';
import {
  GAME_TYPE_PARTY_ACTION_POLICIES,
  GameTypePartyActionPolicyRegistry,
} from '../../../infrastructure/game/types/shared/game-type-party-action-policy-registry';
import {
  GAME_TYPE_PARTY_STAGE_CATALOG_PROVIDERS,
  GameTypePartyStageCatalogProviderRegistry,
} from '../../../infrastructure/game/types/shared/game-type-party-stage-catalog-provider-registry';
import {
  GAME_TYPE_PARTY_STAGE_CONFIGURATION_PROVIDERS,
  GameTypePartyStageConfigurationProviderRegistry,
} from '../../../infrastructure/game/types/shared/game-type-party-stage-configuration-provider-registry';
import { PrismaOrganizationMemberRepository } from '../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaProjectRepository } from '../../../infrastructure/project/repositories/prisma-project-repository';
import { GameManagementResolver } from '../../../presentation/game/management/graphql/game-management-resolver';
import { PartyManagementResolver } from '../../../presentation/game/party/graphql/party-management-resolver';
import { PartyObserverGateway } from '../../../presentation/game/party/realtime/party-observer-gateway';
import { HostPartyObservationMessageMapper } from '../../../presentation/game/party/realtime/services/host-party-observation-message-mapper';
import { PartyObservationAudienceResolver } from '../../../presentation/game/party/realtime/services/party-observation-audience-resolver';
import { PlayerPartyObservationMessageMapper } from '../../../presentation/game/party/realtime/services/player-party-observation-message-mapper';
import { SocketPartyObservationBroadcaster } from '../../../presentation/game/party/realtime/services/socket-party-observation-broadcaster';
import { GameErrorTranslationService } from '../../../presentation/game/shared/error-handling/game-error-translation.service';
import { ERROR_CODE_TRANSLATORS } from '../../../presentation/shared/error-handling/error-code-translators.token';
import { ErrorTranslationService } from '../../../presentation/shared/error-handling/error-translation-service';
import { I18nWsExceptionFilter } from '../../../presentation/shared/error-handling/i18n-ws-exception-filter';
import { DatabaseModule } from '../database/database-module';
import { IdentityModule } from '../identity/identity-module';
import { SharedServicesModule } from '../shared/shared-services.module';

@Module({
  imports: [DatabaseModule, IdentityModule, SharedServicesModule],
  providers: [
    PrismaGameCatalogAdapter,
    PrismaPlayerPartyActionRuntimeAdapter,
    PrismaPlayerPartyRuntimeAdapter,
    PrismaPartyPlayerRemovalService,
    PrismaPartyManagementAdapter,
    PrismaPartyReadModelMapper,
    PrismaGameSettingsMapper,
    PrismaHostPartyObservationReader,
    PrismaPartyGameTypeReader,
    PrismaHostPartyRuntimeControlAdapter,
    PrismaPlayerPartyObservationReader,
    PrismaPartyStageCatalogAdapter,
    PrismaPartyStageConfigurationAdapter,
    GameTypePartyActionPolicyRegistry,
    GameTypePartyStageCatalogProviderRegistry,
    GameTypePartyStageConfigurationProviderRegistry,
    PredictionPartyStageCatalogEntryResolver,
    PredictionPartyStageConfigurationResolver,
    PrismaOrganizationMemberRepository,
    PrismaProjectRepository,
    QuizPartyStageCatalogEntryResolver,
    QuizPartyStageConfigurationResolver,
    HostPartyRuntimeStageReferenceResolver,
    HostPartyLifecyclePolicy,
    PartyRuntimeContextProjectionService,
    ChoiceSubmissionPartyActionPolicy,
    QuizPartyActionPolicy,
    PredictionPartyActionPolicy,
    {
      provide: GAME_TYPE_PARTY_ACTION_POLICIES,
      useFactory: (
        predictionPartyActionPolicy: PredictionPartyActionPolicy,
        quizPartyActionPolicy: QuizPartyActionPolicy,
      ) => [
        {
          gameType: GameType.Prediction,
          provider: predictionPartyActionPolicy,
        },
        {
          gameType: GameType.Quiz,
          provider: quizPartyActionPolicy,
        },
      ],
      inject: [PredictionPartyActionPolicy, QuizPartyActionPolicy],
    },
    {
      provide: GAME_TYPE_PARTY_STAGE_CONFIGURATION_PROVIDERS,
      useFactory: (
        predictionPartyStageConfigurationResolver: PredictionPartyStageConfigurationResolver,
        quizPartyStageConfigurationResolver: QuizPartyStageConfigurationResolver,
      ) => [
        {
          gameType: GameType.Prediction,
          provider: predictionPartyStageConfigurationResolver,
        },
        {
          gameType: GameType.Quiz,
          provider: quizPartyStageConfigurationResolver,
        },
      ],
      inject: [PredictionPartyStageConfigurationResolver, QuizPartyStageConfigurationResolver],
    },
    {
      provide: GAME_TYPE_PARTY_STAGE_CATALOG_PROVIDERS,
      useFactory: (
        predictionPartyStageCatalogEntryResolver: PredictionPartyStageCatalogEntryResolver,
        quizPartyStageCatalogEntryResolver: QuizPartyStageCatalogEntryResolver,
      ) => [
        {
          gameType: GameType.Prediction,
          provider: predictionPartyStageCatalogEntryResolver,
        },
        {
          gameType: GameType.Quiz,
          provider: quizPartyStageCatalogEntryResolver,
        },
      ],
      inject: [PredictionPartyStageCatalogEntryResolver, QuizPartyStageCatalogEntryResolver],
    },
    StartPartyUseCase,
    AdvanceStageUseCase,
    RestartStageUseCase,
    RewindStageUseCase,
    RewindPartyUseCase,
    PausePartyUseCase,
    ResumePartyUseCase,
    RevealStageResultUseCase,
    EndPartyUseCase,
    KickPartyPlayerUseCase,
    JoinPartyUseCase,
    LeavePartyUseCase,
    SubmitPartyActionUseCase,
    PartyActionIdentifier,
    PartyIdentifier,
    PartyPinIdentifier,
    PartyStageIdentifier,
    CreatePartyUseCase,
    GameIdentifier,
    GameErrorTranslationService,
    GameTypeIdentifier,
    GameTypeParser,
    GuestIdentifier,
    GamePermissionResolver,
    GetHostPartyObservationUseCase,
    GetPlayerPartyObservationUseCase,
    ListProjectGamesUseCase,
    ListPartiesUseCase,
    LoadPartyObservationSnapshotUseCase,
    OrganizationIdentifier,
    OrganizationMemberIdentifier,
    BroadcastPartyObservationUseCase,
    ProjectIdentifier,
    GameManagementResolver,
    PartyManagementResolver,
    PartyObserverGateway,
    HostPartyObservationMessageMapper,
    PartyObservationAudienceResolver,
    PlayerPartyObservationMessageMapper,
    SocketPartyObservationBroadcaster,
    UserIdentifier,
    ErrorTranslationService,
    I18nWsExceptionFilter,
    {
      provide: ERROR_CODE_TRANSLATORS,
      useFactory: (gameErrorTranslationService: GameErrorTranslationService) => [
        gameErrorTranslationService,
      ],
      inject: [GameErrorTranslationService],
    },
    {
      provide: GameCatalogPort,
      useExisting: PrismaGameCatalogAdapter,
    },
    {
      provide: PlayerPartyRuntimePort,
      useExisting: PrismaPlayerPartyRuntimeAdapter,
    },
    {
      provide: PlayerPartyActionRuntimePort,
      useExisting: PrismaPlayerPartyActionRuntimeAdapter,
    },
    {
      provide: PartyManagementPort,
      useExisting: PrismaPartyManagementAdapter,
    },
    {
      provide: HostPartyObservationReaderPort,
      useExisting: PrismaHostPartyObservationReader,
    },
    {
      provide: HostPartyRuntimeControlPort,
      useExisting: PrismaHostPartyRuntimeControlAdapter,
    },
    {
      provide: PlayerPartyObservationReaderPort,
      useExisting: PrismaPlayerPartyObservationReader,
    },
    {
      provide: PartyGameTypeReaderPort,
      useExisting: PrismaPartyGameTypeReader,
    },
    {
      provide: PartyStageConfigurationPort,
      useExisting: PrismaPartyStageConfigurationAdapter,
    },
    {
      provide: PartyStageCatalogPort,
      useExisting: PrismaPartyStageCatalogAdapter,
    },
    {
      provide: GameTypePartyActionPolicyRegistryPort,
      useExisting: GameTypePartyActionPolicyRegistry,
    },
    {
      provide: PartyObservationBroadcasterPort,
      useExisting: SocketPartyObservationBroadcaster,
    },
    {
      provide: OrganizationMemberRepositoryProvider,
      useExisting: PrismaOrganizationMemberRepository,
    },
    {
      provide: ProjectRepositoryProvider,
      useExisting: PrismaProjectRepository,
    },
  ],
  exports: [
    GameCatalogPort,
    HostPartyObservationReaderPort,
    PlayerPartyObservationReaderPort,
    PartyManagementPort,
    CreatePartyUseCase,
    GamePermissionResolver,
    GetHostPartyObservationUseCase,
    GetPlayerPartyObservationUseCase,
    JoinPartyUseCase,
    LeavePartyUseCase,
    ListProjectGamesUseCase,
    ListPartiesUseCase,
    BroadcastPartyObservationUseCase,
  ],
})
export class GameModule {}
