import { Module } from '@nestjs/common';
import { CreateQuizUseCase } from '../../application/quiz/use-cases/create-quiz.use-case';
import { GetAllQuizzesUseCase } from '../../application/quiz/use-cases/get-all-quizzes.use-case';
import { GetQuizQuestionsUseCase } from '../../application/quiz/use-cases/get-quiz-questions.use-case';
import { QuestionRepositoryProvider } from '../../domain/quiz/repositories/question.repository.interface';
import { QuizRepositoryProvider } from '../../domain/quiz/repositories/quiz.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../domain/organization/repositories/organization-member.repository.interface';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PrismaQuestionRepository } from '../repositories/prisma-question.repository';
import { PrismaQuizRepository } from '../repositories/prisma-quiz.repository';
import { PrismaOrganizationMemberRepository } from '../repositories/prisma-organization-member.repository';
import { QuizController } from './quiz.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [QuizController],
  providers: [
    CreateQuizUseCase,
    GetAllQuizzesUseCase,
    GetQuizQuestionsUseCase,
    PrismaQuizRepository,
    PrismaQuestionRepository,
    PrismaOrganizationMemberRepository,
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
  ],
})
export class QuizModule {}
