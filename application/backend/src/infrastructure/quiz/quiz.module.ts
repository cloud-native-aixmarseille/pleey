import { Module } from '@nestjs/common';
import { CreateQuestionUseCase } from '../../application/quiz/use-cases/create-question.use-case';
import { CreateQuizUseCase } from '../../application/quiz/use-cases/create-quiz.use-case';
import { DeleteQuestionUseCase } from '../../application/quiz/use-cases/delete-question.use-case';
import { DeleteQuizUseCase } from '../../application/quiz/use-cases/delete-quiz.use-case';
import { GetAllQuizzesUseCase } from '../../application/quiz/use-cases/get-all-quizzes.use-case';
import { GetQuizQuestionsUseCase } from '../../application/quiz/use-cases/get-quiz-questions.use-case';
import { UpdateQuestionUseCase } from '../../application/quiz/use-cases/update-question.use-case';
import { UpdateQuizUseCase } from '../../application/quiz/use-cases/update-quiz.use-case';
import { GameSessionRepositoryProvider } from '../../domain/game/ports/game-session.repository';
import { OrganizationMemberRepositoryProvider } from '../../domain/organization/ports/organization-member.repository';
import { QuestionRepositoryProvider } from '../../domain/quiz/ports/question.repository';
import { QuizRepositoryProvider } from '../../domain/quiz/ports/quiz.repository';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PrismaGameSessionRepository } from '../game/repositories/prisma-game-session.repository';
import { PrismaOrganizationMemberRepository } from '../organization/repositories/prisma-organization-member.repository';
import { QuestionsController } from './questions.controller';
import { QuizController } from './quiz.controller';
import { PrismaQuestionRepository } from './repositories/prisma-question.repository';
import { PrismaQuizRepository } from './repositories/prisma-quiz.repository';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [QuizController, QuestionsController],
  providers: [
    // Repository implementations
    PrismaQuizRepository,
    PrismaQuestionRepository,
    PrismaOrganizationMemberRepository,
    PrismaGameSessionRepository,

    // Repository bindings
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
    {
      provide: GameSessionRepositoryProvider,
      useExisting: PrismaGameSessionRepository,
    },

    CreateQuizUseCase,
    CreateQuestionUseCase,
    DeleteQuizUseCase,
    DeleteQuestionUseCase,
    GetAllQuizzesUseCase,
    GetQuizQuestionsUseCase,
    UpdateQuestionUseCase,
    UpdateQuizUseCase,
  ],
})
export class QuizModule {}
