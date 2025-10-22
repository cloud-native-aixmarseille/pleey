import { Module } from '@nestjs/common';
import { CreateGameSessionUseCase } from '../../application/game/use-cases/create-game-session.use-case';
import { GetLeaderboardUseCase } from '../../application/game/use-cases/get-leaderboard.use-case';
import { SubmitAnswerUseCase } from '../../application/game/use-cases/submit-answer.use-case';
import { ScoreCalculatorService } from '../../domain/game/services/score-calculator.service';
import {
  GameSessionRepositoryProvider,
} from '../../domain/game/repositories/game-session.repository.interface';
import { ScoreRepositoryProvider } from '../../domain/game/repositories/score.repository.interface';
import { QuestionRepositoryProvider } from '../../domain/quiz/repositories/question.repository.interface';
import { QuizRepositoryProvider } from '../../domain/quiz/repositories/quiz.repository.interface';
import { DatabaseModule } from '../database/database.module';
import { PrismaGameSessionRepository } from '../repositories/prisma-game-session.repository';
import { PrismaQuestionRepository } from '../repositories/prisma-question.repository';
import { PrismaQuizRepository } from '../repositories/prisma-quiz.repository';
import { PrismaScoreRepository } from '../repositories/prisma-score.repository';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';

@Module({
  imports: [DatabaseModule],
  controllers: [GameController],
  providers: [
    CreateGameSessionUseCase,
    GetLeaderboardUseCase,
    SubmitAnswerUseCase,
    ScoreCalculatorService,
    PrismaGameSessionRepository,
    PrismaScoreRepository,
    PrismaQuestionRepository,
    PrismaQuizRepository,
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
    GameGateway,
  ],
})
export class GameModule { }
