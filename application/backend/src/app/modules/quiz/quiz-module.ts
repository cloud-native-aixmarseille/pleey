import { Module } from '@nestjs/common';
import { CreateQuestionUseCase } from '../../../application/quiz-management/use-cases/create-question-use-case';
import { CreateQuizUseCase } from '../../../application/quiz-management/use-cases/create-quiz-use-case';
import { DeleteQuestionUseCase } from '../../../application/quiz-management/use-cases/delete-question-use-case';
import { DeleteQuizUseCase } from '../../../application/quiz-management/use-cases/delete-quiz-use-case';
import { ListQuizQuestionsUseCase } from '../../../application/quiz-management/use-cases/list-quiz-questions-use-case';
import { ListQuizzesUseCase } from '../../../application/quiz-management/use-cases/list-quizzes-use-case';
import { UpdateQuestionUseCase } from '../../../application/quiz-management/use-cases/update-question-use-case';
import { UpdateQuizUseCase } from '../../../application/quiz-management/use-cases/update-quiz-use-case';
import { GameRepositoryProvider } from '../../../domain/game/ports/repositories/game.repository';
import { GameSessionRepositoryProvider } from '../../../domain/game/ports/repositories/game-session.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { QuestionRepositoryProvider } from '../../../domain/quiz/ports/question.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';
import { QuestionAnswerService } from '../../../domain/quiz/services/question-answer-service';
import { PrismaGameRepository } from '../../../infrastructure/game/repositories/prisma-game-repository';
import { PrismaGameSessionRepository } from '../../../infrastructure/game/repositories/prisma-game-session-repository';
import { PrismaOrganizationMemberRepository } from '../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaProjectRepository } from '../../../infrastructure/project/repositories/prisma-project-repository';
import { PrismaQuestionRepository } from '../../../infrastructure/quiz/repositories/prisma-question-repository';
import { PrismaQuizRepository } from '../../../infrastructure/quiz/repositories/prisma-quiz-repository';
import { QuizResolver } from '../../../presentation/quiz-management/graphql/quiz-resolver';
import { AuthModule } from '../auth/auth-module';
import { DatabaseModule } from '../database/database-module';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    // Repository implementations
    PrismaQuizRepository,
    PrismaQuestionRepository,
    PrismaOrganizationMemberRepository,
    PrismaGameSessionRepository,
    PrismaGameRepository,
    PrismaProjectRepository,

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
    {
      provide: GameRepositoryProvider,
      useExisting: PrismaGameRepository,
    },
    {
      provide: ProjectRepositoryProvider,
      useExisting: PrismaProjectRepository,
    },
    QuestionAnswerService,

    CreateQuizUseCase,
    CreateQuestionUseCase,
    DeleteQuizUseCase,
    DeleteQuestionUseCase,
    ListQuizzesUseCase,
    ListQuizQuestionsUseCase,
    UpdateQuestionUseCase,
    UpdateQuizUseCase,
    QuizResolver,
  ],
})
export class QuizModule {}
