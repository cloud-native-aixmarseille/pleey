import { Module } from '@nestjs/common';
import { CreateGameSessionUseCase } from '../../application/game/use-cases/create-game-session.use-case';
import { StopGameSessionUseCase } from '../../application/game/use-cases/stop-game-session.use-case';
import { ResumeGameSessionUseCase } from '../../application/game/use-cases/resume-game-session.use-case';
import { GetActiveSessionsUseCase } from '../../application/game/use-cases/get-active-sessions.use-case';
import { GetQuizSessionsUseCase } from '../../application/game/use-cases/get-quiz-sessions.use-case';
import { GetLeaderboardUseCase } from '../../application/game/use-cases/get-leaderboard.use-case';
import { SubmitAnswerUseCase } from '../../application/game/use-cases/submit-answer.use-case';
import { ScoreCalculatorService } from '../../domain/game/services/score-calculator.service';
import { AvatarGeneratorService } from '../../domain/shared/services/avatar-generator.service';
import {
  GameSessionRepositoryProvider,
} from '../../domain/game/repositories/game-session.repository.interface';
import { ScoreRepositoryProvider } from '../../domain/game/repositories/score.repository.interface';
import { QuestionRepositoryProvider } from '../../domain/quiz/repositories/question.repository.interface';
import { QuizRepositoryProvider } from '../../domain/quiz/repositories/quiz.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../domain/organization/repositories/organization-member.repository.interface';
import { DatabaseModule } from '../database/database.module';
import { PrismaGameSessionRepository } from '../repositories/prisma-game-session.repository';
import { PrismaQuestionRepository } from '../repositories/prisma-question.repository';
import { PrismaQuizRepository } from '../repositories/prisma-quiz.repository';
import { PrismaScoreRepository } from '../repositories/prisma-score.repository';
import { PrismaOrganizationMemberRepository } from '../repositories/prisma-organization-member.repository';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { I18nWsExceptionFilter } from '../filters/i18n-ws-exception.filter';

@Module({
  imports: [DatabaseModule],
  controllers: [GameController],
  providers: [
    CreateGameSessionUseCase,
    StopGameSessionUseCase,
    ResumeGameSessionUseCase,
    GetActiveSessionsUseCase,
    GetQuizSessionsUseCase,
    GetLeaderboardUseCase,
    SubmitAnswerUseCase,
    ScoreCalculatorService,
    AvatarGeneratorService,
    PrismaGameSessionRepository,
    PrismaScoreRepository,
    PrismaQuestionRepository,
    PrismaQuizRepository,
    PrismaOrganizationMemberRepository,
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
    GameGateway,
    I18nWsExceptionFilter,
  ],
})
export class GameModule { }
