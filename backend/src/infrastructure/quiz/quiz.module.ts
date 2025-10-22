import { Module } from '@nestjs/common';
import { GetAllQuizzesUseCase } from '../../application/quiz/use-cases/get-all-quizzes.use-case';
import { GetQuizQuestionsUseCase } from '../../application/quiz/use-cases/get-quiz-questions.use-case';
import { QuestionRepositoryProvider } from '../../domain/quiz/repositories/question.repository.interface';
import { QuizRepositoryProvider } from '../../domain/quiz/repositories/quiz.repository.interface';
import { DatabaseModule } from '../database/database.module';
import { PrismaQuestionRepository } from '../repositories/prisma-question.repository';
import { PrismaQuizRepository } from '../repositories/prisma-quiz.repository';
import { QuizController } from './quiz.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [QuizController],
  providers: [
    GetAllQuizzesUseCase,
    GetQuizQuestionsUseCase,
    PrismaQuizRepository,
    PrismaQuestionRepository,
    {
      provide: QuizRepositoryProvider,
      useExisting: PrismaQuizRepository,
    },
    {
      provide: QuestionRepositoryProvider,
      useExisting: PrismaQuestionRepository,
    },
  ],
})
export class QuizModule { }
