import { Module } from '@nestjs/common';
import { GameBroadcastServiceProvider } from '../../application/game/ports/game-broadcast.service.interface';
import { AnswerRevealSchedulerService } from '../../application/game/services/answer-reveal-scheduler.service';
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
import { GameTimerServiceProvider } from '../../domain/game/ports/game-timer.service.interface';
import { GameSessionRepositoryProvider } from '../../domain/game/repositories/game-session.repository.interface';
import { ScoreRepositoryProvider } from '../../domain/game/repositories/score.repository.interface';
import { SessionStateRepositoryProvider } from '../../domain/game/repositories/session-state.repository.interface';
import { AnswerRevealPolicy } from '../../domain/game/services/answer-reveal-policy.service';
import { ScoreCalculatorService } from '../../domain/game/services/score-calculator.service';
import { OrganizationMemberRepositoryProvider } from '../../domain/organization/repositories/organization-member.repository.interface';
import { QuestionRepositoryProvider } from '../../domain/quiz/repositories/question.repository.interface';
import { QuizRepositoryProvider } from '../../domain/quiz/repositories/quiz.repository.interface';
import { AvatarGeneratorService } from '../../domain/shared/services/avatar-generator.service';
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

    // Application Services
    AnswerRevealSchedulerService,

    // Domain Services
    AnswerRevealPolicy,
    ScoreCalculatorService,
    AvatarGeneratorService,

    // Infrastructure - Repositories (concrete implementations)
    PrismaGameSessionRepository,
    PrismaScoreRepository,
    PrismaQuestionRepository,
    PrismaQuizRepository,
    PrismaOrganizationMemberRepository,
    ValkeySessionStateRepository,

    // Infrastructure - Services (concrete implementations)
    NodeGameTimerService,
    SocketGameBroadcastService,

    // Repository Provider Bindings (DIP - depend on abstractions)
    {
      provide: GameSessionRepositoryProvider,
      useExisting: PrismaGameSessionRepository,
    },
    {
      provide: ScoreRepositoryProvider,
      useExisting: PrismaScoreRepository,
    },
    {
      provide: QuestionRepositoryProvider,
      useExisting: PrismaQuestionRepository,
    },
    {
      provide: QuizRepositoryProvider,
      useExisting: PrismaQuizRepository,
    },
    {
      provide: OrganizationMemberRepositoryProvider,
      useExisting: PrismaOrganizationMemberRepository,
    },
    {
      provide: SessionStateRepositoryProvider,
      useExisting: ValkeySessionStateRepository,
    },

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
