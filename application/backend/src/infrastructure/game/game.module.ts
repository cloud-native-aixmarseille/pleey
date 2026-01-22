import { Logger, Module } from '@nestjs/common';
import { GameBroadcastServiceProvider } from '../../application/game/ports/game-broadcast.service';
import { CreateGameSessionUseCase } from '../../application/game/use-cases/create-game-session.use-case';
import { EndGameUseCase } from '../../application/game/use-cases/end-game.use-case';
import { GetActiveSessionsUseCase } from '../../application/game/use-cases/get-active-sessions.use-case';
import { GetLeaderboardUseCase } from '../../application/game/use-cases/get-leaderboard.use-case';
import { GetQuizSessionsUseCase } from '../../application/game/use-cases/get-quiz-sessions.use-case';
import { HandleDisconnectWsUseCase } from '../../application/game/use-cases/handle-disconnect-ws.use-case';
import { JoinGameWsUseCase } from '../../application/game/use-cases/join-game-ws.use-case';
import { NextQuestionWsUseCase } from '../../application/game/use-cases/next-question-ws.use-case';
import { PauseGameWsUseCase } from '../../application/game/use-cases/pause-game-ws.use-case';
import { ResumeGameSessionUseCase } from '../../application/game/use-cases/resume-game-session.use-case';
import { ResumeGameWsUseCase } from '../../application/game/use-cases/resume-game-ws.use-case';
import { RevealAnswersUseCase } from '../../application/game/use-cases/reveal-answers.use-case';
import { StartGameWsUseCase } from '../../application/game/use-cases/start-game-ws.use-case';
import { StopGameSessionUseCase } from '../../application/game/use-cases/stop-game-session.use-case';
import { SubmitAnswerUseCase } from '../../application/game/use-cases/submit-answer.use-case';
import { SubmitAnswerWsUseCase } from '../../application/game/use-cases/submit-answer-ws.use-case';
import { GameSessionRepositoryProvider } from '../../domain/game/ports/game-session.repository';
import { GameTimerServiceProvider } from '../../domain/game/ports/game-timer.service';
import { ScoreRepositoryProvider } from '../../domain/game/ports/score.repository';
import { SessionStateRepositoryProvider } from '../../domain/game/ports/session-state.repository';
import { AnswerRevealPolicy } from '../../domain/game/services/answer-reveal-policy.service';
import { AnswerRevealSchedulerService } from '../../domain/game/services/answer-reveal-scheduler.service';
import { GameSessionStateService } from '../../domain/game/services/game-session-state.service';
import { ScoreCalculatorService } from '../../domain/game/services/score-calculator.service';
import { OrganizationMemberRepositoryProvider } from '../../domain/organization/ports/organization-member.repository';
import { QuestionRepositoryProvider } from '../../domain/quiz/ports/question.repository';
import { QuizRepositoryProvider } from '../../domain/quiz/ports/quiz.repository';
import { DatabaseModule } from '../database/database.module';
import { PrismaOrganizationMemberRepository } from '../organization/repositories/prisma-organization-member.repository';
import { PrismaQuestionRepository } from '../quiz/repositories/prisma-question.repository';
import { PrismaQuizRepository } from '../quiz/repositories/prisma-quiz.repository';
import { ErrorTranslationService } from '../shared/filters/error-translation.service';
import { I18nWsExceptionFilter } from '../shared/filters/i18n-ws-exception.filter';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { PrismaGameSessionRepository } from './repositories/prisma-game-session.repository';
import { PrismaScoreRepository } from './repositories/prisma-score.repository';
import { ValkeySessionStateRepository } from './repositories/valkey-session-state.repository';
import { NodeGameTimerService } from './services/node-game-timer.service';
import { SocketGameBroadcastService } from './services/socket-game-broadcast.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GameController],
  providers: [
    Logger,
    // Repository implementations
    PrismaGameSessionRepository,
    PrismaScoreRepository,
    ValkeySessionStateRepository,
    PrismaQuizRepository,
    PrismaQuestionRepository,
    PrismaOrganizationMemberRepository,

    // Repository bindings
    {
      provide: GameSessionRepositoryProvider,
      useExisting: PrismaGameSessionRepository,
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
      provide: QuestionRepositoryProvider,
      useExisting: PrismaQuestionRepository,
    },
    {
      provide: OrganizationMemberRepositoryProvider,
      useExisting: PrismaOrganizationMemberRepository,
    },

    // Use Cases
    CreateGameSessionUseCase,
    StopGameSessionUseCase,
    ResumeGameSessionUseCase,
    GetActiveSessionsUseCase,
    GetQuizSessionsUseCase,
    GetLeaderboardUseCase,
    SubmitAnswerUseCase,
    EndGameUseCase,
    RevealAnswersUseCase,

    // WebSocket Use Cases
    HandleDisconnectWsUseCase,
    JoinGameWsUseCase,
    StartGameWsUseCase,
    SubmitAnswerWsUseCase,
    NextQuestionWsUseCase,
    PauseGameWsUseCase,
    ResumeGameWsUseCase,

    // Domain Services
    AnswerRevealPolicy,
    AnswerRevealSchedulerService,
    GameSessionStateService,
    ScoreCalculatorService,

    // Infrastructure - Services (concrete implementations)
    NodeGameTimerService,
    SocketGameBroadcastService,

    // Service Provider Bindings (DIP - depend on abstractions)
    {
      provide: GameTimerServiceProvider,
      useExisting: NodeGameTimerService,
    },
    {
      provide: GameBroadcastServiceProvider,
      useExisting: SocketGameBroadcastService,
    },
    // Gateway & Filters
    GameGateway,
    ErrorTranslationService,
    I18nWsExceptionFilter,
  ],
})
export class GameModule {}
