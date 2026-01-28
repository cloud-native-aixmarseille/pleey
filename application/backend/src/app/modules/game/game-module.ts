import { Logger, Module } from '@nestjs/common';
import { HostStageControlContextService } from '../../../application/game-session/live/host/services/host-stage-control-context-service';
import { AdvanceGameStageUseCase } from '../../../application/game-session/live/host/use-cases/advance-game-stage-use-case';
import { EndGameUseCase } from '../../../application/game-session/live/host/use-cases/end-game-use-case';
import { PauseGameUseCase } from '../../../application/game-session/live/host/use-cases/pause-game-use-case';
import { RestartGameStageUseCase } from '../../../application/game-session/live/host/use-cases/restart-game-stage-use-case';
import { ResumeGameUseCase } from '../../../application/game-session/live/host/use-cases/resume-game-use-case';
import { ReturnGameToLobbyUseCase } from '../../../application/game-session/live/host/use-cases/return-game-to-lobby-use-case';
import { RevealGameResultUseCase } from '../../../application/game-session/live/host/use-cases/reveal-game-result-use-case';
import { RewindGameStageUseCase } from '../../../application/game-session/live/host/use-cases/rewind-game-stage-use-case';
import { StartGameUseCase } from '../../../application/game-session/live/host/use-cases/start-game-use-case';
import { JoinGameUseCase } from '../../../application/game-session/live/player/use-cases/join-game-use-case';
import { RemoveDisconnectedPlayerUseCase } from '../../../application/game-session/live/player/use-cases/remove-disconnected-player-use-case';
import { SubmitActionUseCase } from '../../../application/game-session/live/player/use-cases/submit-action-use-case';
import { GameSessionPinContextService } from '../../../application/game-session/live/shared/services/game-session-pin-context-service';
import { CreateHostSessionUseCase } from '../../../application/game-session/management/use-cases/create-host-session-use-case';
import { GetActiveHostSessionByPinUseCase } from '../../../application/game-session/management/use-cases/get-active-host-session-by-pin-use-case';
import { GetCurrentPlayerSessionUseCase } from '../../../application/game-session/management/use-cases/get-current-player-session-use-case';
import { LeaveCurrentPlayerSessionUseCase } from '../../../application/game-session/management/use-cases/leave-current-player-session-use-case';
import { ListActiveHostSessionsUseCase } from '../../../application/game-session/management/use-cases/list-active-host-sessions-use-case';
import { ListGameHostSessionsUseCase } from '../../../application/game-session/management/use-cases/list-game-host-sessions-use-case';
import { ResumeHostSessionUseCase } from '../../../application/game-session/management/use-cases/resume-host-session-use-case';
import { StopHostSessionUseCase } from '../../../application/game-session/management/use-cases/stop-host-session-use-case';
import { GameType } from '../../../domain/game/enums/game-type.enum';
import { GameJoinHandlerRegistryProvider } from '../../../domain/game/ports/handlers/game-join-handler.registry';
import { GameNextStageHandlerRegistryProvider } from '../../../domain/game/ports/handlers/game-next-stage-handler.registry';
import { GamePauseHandlerRegistryProvider } from '../../../domain/game/ports/handlers/game-pause-handler.registry';
import { GameResumeHandlerRegistryProvider } from '../../../domain/game/ports/handlers/game-resume-handler.registry';
import { GameResumeSessionHandlerRegistryProvider } from '../../../domain/game/ports/handlers/game-resume-session-handler.registry';
import { GameRevealResultHandlerRegistryProvider } from '../../../domain/game/ports/handlers/game-reveal-result-handler.registry';
import { GameStartHandlerRegistryProvider } from '../../../domain/game/ports/handlers/game-start-handler.registry';
import { GameSubmitActionHandlerRegistryProvider } from '../../../domain/game/ports/handlers/game-submit-action-handler.registry';
import { GameRepositoryProvider } from '../../../domain/game/ports/repositories/game.repository';
import { GameSessionRepositoryProvider } from '../../../domain/game/ports/repositories/game-session.repository';
import { GuestRepositoryProvider } from '../../../domain/game/ports/repositories/guest.repository';
import { ScoreRepositoryProvider } from '../../../domain/game/ports/repositories/score.repository';
import { SessionStateRepositoryProvider } from '../../../domain/game/ports/repositories/session-state.repository';
import { GameBroadcastServiceProvider } from '../../../domain/game/ports/services/game-broadcast.service';
import { GameContentProviderRegistryProvider } from '../../../domain/game/ports/services/game-content-provider';
import { GameEndingServiceProvider } from '../../../domain/game/ports/services/game-ending.service';
import { GameTimerServiceProvider } from '../../../domain/game/ports/services/game-timer.service';
import { ResultRevealServiceProvider } from '../../../domain/game/ports/services/result-reveal.service';
import { ScoreCalculatorProvider } from '../../../domain/game/ports/services/score-calculator.service';
import { ActionDistributionService } from '../../../domain/game/services/action-distribution-service';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state-service';
import { ResultRevealPolicy } from '../../../domain/game/services/result-reveal-policy';
import { ResultRevealSchedulerService } from '../../../domain/game/services/result-reveal-scheduler-service';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { PredictionGameJoinHandler } from '../../../domain/prediction/game-handlers/prediction-game-join-handler';
import { PredictionGameNextStageHandler } from '../../../domain/prediction/game-handlers/prediction-game-next-stage-handler';
import { PredictionGamePauseHandler } from '../../../domain/prediction/game-handlers/prediction-game-pause-handler';
import { PredictionGameResumeHandler } from '../../../domain/prediction/game-handlers/prediction-game-resume-handler';
import { PredictionGameResumeSessionHandler } from '../../../domain/prediction/game-handlers/prediction-game-resume-session-handler';
import { PredictionGameRevealResultHandler } from '../../../domain/prediction/game-handlers/prediction-game-reveal-result-handler';
import { PredictionGameStartHandler } from '../../../domain/prediction/game-handlers/prediction-game-start-handler';
import { PredictionGameSubmitActionHandler } from '../../../domain/prediction/game-handlers/prediction-game-submit-action-handler';
import { PredictionRepositoryProvider } from '../../../domain/prediction/ports/prediction.repository';
import { PredictionPromptRepositoryProvider } from '../../../domain/prediction/ports/prediction-prompt.repository';
import { PredictionGameContentProvider } from '../../../domain/prediction/services/prediction-game-content-provider';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { QuizGameJoinHandler } from '../../../domain/quiz/game-handlers/quiz-game-join-handler';
import { QuizGameNextStageHandler } from '../../../domain/quiz/game-handlers/quiz-game-next-stage-handler';
import { QuizGamePauseHandler } from '../../../domain/quiz/game-handlers/quiz-game-pause-handler';
import { QuizGameResumeHandler } from '../../../domain/quiz/game-handlers/quiz-game-resume-handler';
import { QuizGameResumeSessionHandler } from '../../../domain/quiz/game-handlers/quiz-game-resume-session-handler';
import { QuizGameRevealResultHandler } from '../../../domain/quiz/game-handlers/quiz-game-reveal-result-handler';
import { QuizGameStartHandler } from '../../../domain/quiz/game-handlers/quiz-game-start-handler';
import { QuizGameSubmitActionHandler } from '../../../domain/quiz/game-handlers/quiz-game-submit-action-handler';
import { QuestionRepositoryProvider } from '../../../domain/quiz/ports/question.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';
import { QuizGameContentProvider } from '../../../domain/quiz/services/quiz-game-content-provider';
import { QuizScoreCalculatorService } from '../../../domain/quiz/services/quiz-score-calculator-service';
import {
  GAME_JOIN_HANDLERS,
  GameJoinHandlerRegistryService,
} from '../../../infrastructure/game/handlers/game-join-handler-registry-service';
import {
  GAME_NEXT_STAGE_HANDLERS,
  GameNextStageHandlerRegistryService,
} from '../../../infrastructure/game/handlers/game-next-stage-handler-registry-service';
import {
  GAME_PAUSE_HANDLERS,
  GamePauseHandlerRegistryService,
} from '../../../infrastructure/game/handlers/game-pause-handler-registry-service';
import {
  GAME_RESUME_HANDLERS,
  GameResumeHandlerRegistryService,
} from '../../../infrastructure/game/handlers/game-resume-handler-registry-service';
import {
  GAME_RESUME_SESSION_HANDLERS,
  GameResumeSessionHandlerRegistryService,
} from '../../../infrastructure/game/handlers/game-resume-session-handler-registry-service';
import {
  GAME_REVEAL_RESULT_HANDLERS,
  GameRevealResultHandlerRegistryService,
} from '../../../infrastructure/game/handlers/game-reveal-result-handler-registry-service';
import {
  GAME_START_HANDLERS,
  GameStartHandlerRegistryService,
} from '../../../infrastructure/game/handlers/game-start-handler-registry-service';
import {
  GAME_SUBMIT_ACTION_HANDLERS,
  GameSubmitActionHandlerRegistryService,
} from '../../../infrastructure/game/handlers/game-submit-action-handler-registry-service';
import { PrismaGameRepository } from '../../../infrastructure/game/repositories/prisma-game-repository';
import { PrismaGameSessionRepository } from '../../../infrastructure/game/repositories/prisma-game-session-repository';
import { PrismaGuestRepository } from '../../../infrastructure/game/repositories/prisma-guest-repository';
import { PrismaScoreRepository } from '../../../infrastructure/game/repositories/prisma-score-repository';
import { ValkeySessionStateRepository } from '../../../infrastructure/game/repositories/valkey-session-state-repository';
import {
  GAME_CONTENT_PROVIDERS,
  GameContentProviderRegistryService,
} from '../../../infrastructure/game/services/game-content-provider-registry-service';
import { NodeGameTimerService } from '../../../infrastructure/game/services/node-game-timer-service';
import { PrismaOrganizationMemberRepository } from '../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaPredictionPromptRepository } from '../../../infrastructure/prediction/repositories/prisma-prediction-prompt-repository';
import { PrismaPredictionRepository } from '../../../infrastructure/prediction/repositories/prisma-prediction-repository';
import { PrismaProjectRepository } from '../../../infrastructure/project/repositories/prisma-project-repository';
import { PrismaQuestionRepository } from '../../../infrastructure/quiz/repositories/prisma-question-repository';
import { PrismaQuizRepository } from '../../../infrastructure/quiz/repositories/prisma-quiz-repository';
import { HostGameGateway } from '../../../presentation/game-session/live/host/realtime/host-game-gateway';
import { PlayerGameGateway } from '../../../presentation/game-session/live/player/realtime/player-game-gateway';
import { GameSessionObserverGateway } from '../../../presentation/game-session/live/shared/realtime/game-session-observer-gateway';
import { AvatarUriService } from '../../../presentation/game-session/live/shared/realtime/services/avatar-uri-service';
import { SocketGameBroadcastMessageMapper } from '../../../presentation/game-session/live/shared/realtime/services/socket-game-broadcast-message-mapper';
import { SocketGameBroadcastService } from '../../../presentation/game-session/live/shared/realtime/services/socket-game-broadcast-service';
import { GameSessionManagementResolver } from '../../../presentation/game-session/management/graphql/game-session-management-resolver';
import { ErrorTranslationService } from '../../../presentation/shared/error-handling/error-translation-service';
import { I18nWsExceptionFilter } from '../../../presentation/shared/error-handling/i18n-ws-exception-filter';
import { AppConfigModule } from '../../config/app-config.module';
import { AuthModule } from '../auth/auth-module';
import { DatabaseModule } from '../database/database-module';

@Module({
  imports: [AppConfigModule, DatabaseModule, AuthModule],
  providers: [
    Logger,
    // Repository implementations
    PrismaGameSessionRepository,
    PrismaGuestRepository,
    PrismaScoreRepository,
    ValkeySessionStateRepository,
    PrismaQuizRepository,
    PrismaGameRepository,
    PrismaQuestionRepository,
    PrismaPredictionRepository,
    PrismaPredictionPromptRepository,
    PrismaOrganizationMemberRepository,
    PrismaProjectRepository,

    // Repository bindings
    {
      provide: GameSessionRepositoryProvider,
      useExisting: PrismaGameSessionRepository,
    },
    {
      provide: GuestRepositoryProvider,
      useExisting: PrismaGuestRepository,
    },
    {
      provide: ScoreRepositoryProvider,
      useExisting: PrismaScoreRepository,
    },
    {
      provide: SessionStateRepositoryProvider,
      useExisting: ValkeySessionStateRepository,
    },
    {
      provide: QuizRepositoryProvider,
      useExisting: PrismaQuizRepository,
    },
    {
      provide: GameRepositoryProvider,
      useExisting: PrismaGameRepository,
    },
    {
      provide: QuestionRepositoryProvider,
      useExisting: PrismaQuestionRepository,
    },
    {
      provide: PredictionRepositoryProvider,
      useExisting: PrismaPredictionRepository,
    },
    {
      provide: PredictionPromptRepositoryProvider,
      useExisting: PrismaPredictionPromptRepository,
    },
    {
      provide: OrganizationMemberRepositoryProvider,
      useExisting: PrismaOrganizationMemberRepository,
    },
    {
      provide: ProjectRepositoryProvider,
      useExisting: PrismaProjectRepository,
    },

    // Host session lifecycle
    CreateHostSessionUseCase,
    GetActiveHostSessionByPinUseCase,
    GetCurrentPlayerSessionUseCase,
    LeaveCurrentPlayerSessionUseCase,
    StopHostSessionUseCase,
    ResumeHostSessionUseCase,
    ListActiveHostSessionsUseCase,
    ListGameHostSessionsUseCase,

    // Host stage controls
    HostStageControlContextService,
    GameSessionPinContextService,
    StartGameUseCase,
    AdvanceGameStageUseCase,
    RestartGameStageUseCase,
    PauseGameUseCase,
    ReturnGameToLobbyUseCase,
    RewindGameStageUseCase,
    ResumeGameUseCase,
    EndGameUseCase,

    // Shared and player flow
    SubmitActionUseCase,
    RevealGameResultUseCase,
    RemoveDisconnectedPlayerUseCase,
    JoinGameUseCase,

    // Game type handlers
    QuizGameStartHandler,
    PredictionGameStartHandler,
    GameStartHandlerRegistryService,
    QuizGameJoinHandler,
    PredictionGameJoinHandler,
    GameJoinHandlerRegistryService,
    QuizGamePauseHandler,
    PredictionGamePauseHandler,
    GamePauseHandlerRegistryService,
    QuizGameResumeSessionHandler,
    PredictionGameResumeSessionHandler,
    GameResumeSessionHandlerRegistryService,
    QuizGameNextStageHandler,
    PredictionGameNextStageHandler,
    GameNextStageHandlerRegistryService,
    QuizGameResumeHandler,
    PredictionGameResumeHandler,
    GameResumeHandlerRegistryService,
    QuizGameRevealResultHandler,
    PredictionGameRevealResultHandler,
    GameRevealResultHandlerRegistryService,
    QuizGameSubmitActionHandler,
    PredictionGameSubmitActionHandler,
    GameSubmitActionHandlerRegistryService,
    QuizGameContentProvider,
    PredictionGameContentProvider,
    GameContentProviderRegistryService,

    // Game type bindings
    {
      provide: GAME_CONTENT_PROVIDERS,
      useFactory: (
        quizProvider: QuizGameContentProvider,
        predictionProvider: PredictionGameContentProvider,
      ) => [
        { gameType: GameType.QUIZ, provider: quizProvider },
        { gameType: GameType.PREDICTION, provider: predictionProvider },
      ],
      inject: [QuizGameContentProvider, PredictionGameContentProvider],
    },
    {
      provide: GAME_JOIN_HANDLERS,
      useFactory: (
        quizHandler: QuizGameJoinHandler,
        predictionHandler: PredictionGameJoinHandler,
      ) => [
        { gameType: GameType.QUIZ, provider: quizHandler },
        { gameType: GameType.PREDICTION, provider: predictionHandler },
      ],
      inject: [QuizGameJoinHandler, PredictionGameJoinHandler],
    },
    {
      provide: GAME_START_HANDLERS,
      useFactory: (
        quizHandler: QuizGameStartHandler,
        predictionHandler: PredictionGameStartHandler,
      ) => [
        { gameType: GameType.QUIZ, provider: quizHandler },
        { gameType: GameType.PREDICTION, provider: predictionHandler },
      ],
      inject: [QuizGameStartHandler, PredictionGameStartHandler],
    },
    {
      provide: GAME_NEXT_STAGE_HANDLERS,
      useFactory: (
        quizHandler: QuizGameNextStageHandler,
        predictionHandler: PredictionGameNextStageHandler,
      ) => [
        { gameType: GameType.QUIZ, provider: quizHandler },
        { gameType: GameType.PREDICTION, provider: predictionHandler },
      ],
      inject: [QuizGameNextStageHandler, PredictionGameNextStageHandler],
    },
    {
      provide: GAME_PAUSE_HANDLERS,
      useFactory: (
        quizHandler: QuizGamePauseHandler,
        predictionHandler: PredictionGamePauseHandler,
      ) => [
        { gameType: GameType.QUIZ, provider: quizHandler },
        { gameType: GameType.PREDICTION, provider: predictionHandler },
      ],
      inject: [QuizGamePauseHandler, PredictionGamePauseHandler],
    },
    {
      provide: GAME_RESUME_HANDLERS,
      useFactory: (
        quizHandler: QuizGameResumeHandler,
        predictionHandler: PredictionGameResumeHandler,
      ) => [
        { gameType: GameType.QUIZ, provider: quizHandler },
        { gameType: GameType.PREDICTION, provider: predictionHandler },
      ],
      inject: [QuizGameResumeHandler, PredictionGameResumeHandler],
    },
    {
      provide: GAME_RESUME_SESSION_HANDLERS,
      useFactory: (
        quizHandler: QuizGameResumeSessionHandler,
        predictionHandler: PredictionGameResumeSessionHandler,
      ) => [
        { gameType: GameType.QUIZ, provider: quizHandler },
        { gameType: GameType.PREDICTION, provider: predictionHandler },
      ],
      inject: [QuizGameResumeSessionHandler, PredictionGameResumeSessionHandler],
    },
    {
      provide: GAME_REVEAL_RESULT_HANDLERS,
      useFactory: (
        quizHandler: QuizGameRevealResultHandler,
        predictionHandler: PredictionGameRevealResultHandler,
      ) => [
        { gameType: GameType.QUIZ, provider: quizHandler },
        { gameType: GameType.PREDICTION, provider: predictionHandler },
      ],
      inject: [QuizGameRevealResultHandler, PredictionGameRevealResultHandler],
    },
    {
      provide: GAME_SUBMIT_ACTION_HANDLERS,
      useFactory: (
        quizHandler: QuizGameSubmitActionHandler,
        predictionHandler: PredictionGameSubmitActionHandler,
      ) => [
        { gameType: GameType.QUIZ, provider: quizHandler },
        { gameType: GameType.PREDICTION, provider: predictionHandler },
      ],
      inject: [QuizGameSubmitActionHandler, PredictionGameSubmitActionHandler],
    },

    // Domain Services
    ResultRevealPolicy,
    ResultRevealSchedulerService,
    ActionDistributionService,
    GameSessionStateService,
    QuizScoreCalculatorService,

    // Infrastructure - Services (concrete implementations)
    NodeGameTimerService,
    AvatarUriService,
    SocketGameBroadcastMessageMapper,
    SocketGameBroadcastService,
    GameSessionManagementResolver,

    // Service Provider Bindings (DIP - depend on abstractions)
    {
      provide: GameTimerServiceProvider,
      useExisting: NodeGameTimerService,
    },
    {
      provide: GameEndingServiceProvider,
      useExisting: EndGameUseCase,
    },
    {
      provide: ResultRevealServiceProvider,
      useExisting: RevealGameResultUseCase,
    },
    {
      provide: GameBroadcastServiceProvider,
      useExisting: SocketGameBroadcastService,
    },
    {
      provide: GameStartHandlerRegistryProvider,
      useExisting: GameStartHandlerRegistryService,
    },
    {
      provide: GameJoinHandlerRegistryProvider,
      useExisting: GameJoinHandlerRegistryService,
    },
    {
      provide: GamePauseHandlerRegistryProvider,
      useExisting: GamePauseHandlerRegistryService,
    },
    {
      provide: GameResumeSessionHandlerRegistryProvider,
      useExisting: GameResumeSessionHandlerRegistryService,
    },
    {
      provide: GameNextStageHandlerRegistryProvider,
      useExisting: GameNextStageHandlerRegistryService,
    },
    {
      provide: GameResumeHandlerRegistryProvider,
      useExisting: GameResumeHandlerRegistryService,
    },
    {
      provide: GameRevealResultHandlerRegistryProvider,
      useExisting: GameRevealResultHandlerRegistryService,
    },
    {
      provide: GameSubmitActionHandlerRegistryProvider,
      useExisting: GameSubmitActionHandlerRegistryService,
    },
    {
      provide: GameContentProviderRegistryProvider,
      useExisting: GameContentProviderRegistryService,
    },
    {
      provide: ScoreCalculatorProvider,
      useExisting: QuizScoreCalculatorService,
    },
    // Gateway & Filters
    GameSessionObserverGateway,
    HostGameGateway,
    PlayerGameGateway,
    ErrorTranslationService,
    I18nWsExceptionFilter,
  ],
})
export class GameModule {}
