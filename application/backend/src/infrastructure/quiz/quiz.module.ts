import { Module } from '@nestjs/common';
import { CreateQuestionUseCase } from '../../application/quiz/use-cases/create-question.use-case';
import { CreateQuizUseCase } from '../../application/quiz/use-cases/create-quiz.use-case';
import { DeleteQuestionUseCase } from '../../application/quiz/use-cases/delete-question.use-case';
import { DeleteQuizUseCase } from '../../application/quiz/use-cases/delete-quiz.use-case';
import { GetAllQuizzesUseCase } from '../../application/quiz/use-cases/get-all-quizzes.use-case';
import { GetQuizQuestionsUseCase } from '../../application/quiz/use-cases/get-quiz-questions.use-case';
import { UpdateQuestionUseCase } from '../../application/quiz/use-cases/update-question.use-case';
import { QuestionRepositoryProvider } from '../../domain/quiz/repositories/question.repository.interface';
import { QuizRepositoryProvider } from '../../domain/quiz/repositories/quiz.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../domain/organization/repositories/organization-member.repository.interface';
import { GameSessionRepositoryProvider } from '../../domain/game/repositories/game-session.repository.interface';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PrismaQuestionRepository } from '../repositories/prisma-question.repository';
import { PrismaQuizRepository } from '../repositories/prisma-quiz.repository';
import { PrismaOrganizationMemberRepository } from '../repositories/prisma-organization-member.repository';
import { PrismaGameSessionRepository } from '../repositories/prisma-game-session.repository';
import { QuizController } from './quiz.controller';
import { QuestionsController } from './questions.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [QuizController, QuestionsController],
  providers: [
    CreateQuizUseCase,
    CreateQuestionUseCase,
    DeleteQuizUseCase,
    DeleteQuestionUseCase,
    GetAllQuizzesUseCase,
    GetQuizQuestionsUseCase,
    UpdateQuestionUseCase,
    PrismaQuestionRepository,
    PrismaOrganizationMemberRepository,
    PrismaGameSessionRepository,
    {
      provide: QuizRepositoryProvider,
      useClass: PrismaQuizRepository,
    },
    {
      provide: QuestionRepositoryProvider,
      useExisting: PrismaQuestionRepository,
    },
    {
      provide: OrganizationMemberRepositoryProvider,
      useExisting: PrismaOrganizationMemberRepository,
    },
    {
      provide: GameSessionRepositoryProvider,
      useExisting: PrismaGameSessionRepository,
    },
  ],
})
export class QuizModule { }
