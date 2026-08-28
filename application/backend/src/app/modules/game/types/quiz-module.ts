import { Module } from '@nestjs/common';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { QuizImportQuestionMapper } from '../../../../application/game/types/quiz/services/quiz-import-question-mapper';
import { QuizQuestionIdentifier } from '../../../../application/game/types/quiz/services/quiz-question-identifier';
import { QuizSelectableOptionIdentifier } from '../../../../application/game/types/quiz/services/quiz-selectable-option-identifier';
import { CreateQuizFromImportUseCase } from '../../../../application/game/types/quiz/use-cases/create-quiz-from-import-use-case';
import { CreateQuizQuestionUseCase } from '../../../../application/game/types/quiz/use-cases/create-quiz-question-use-case';
import { CreateQuizUseCase } from '../../../../application/game/types/quiz/use-cases/create-quiz-use-case';
import { DeleteQuizQuestionUseCase } from '../../../../application/game/types/quiz/use-cases/delete-quiz-question-use-case';
import { DeleteQuizUseCase } from '../../../../application/game/types/quiz/use-cases/delete-quiz-use-case';
import { GetQuizUseCase } from '../../../../application/game/types/quiz/use-cases/get-quiz-use-case';
import { ListQuizQuestionsUseCase } from '../../../../application/game/types/quiz/use-cases/list-quiz-questions-use-case';
import { UpdateQuizQuestionUseCase } from '../../../../application/game/types/quiz/use-cases/update-quiz-question-use-case';
import { UpdateQuizUseCase } from '../../../../application/game/types/quiz/use-cases/update-quiz-use-case';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { GameTypeManagementAccessGuard } from '../../../../application/game/types/shared/services/game-type-management-access-guard';
import { playableContentImportProviders } from '../../../../application/game/types/shared/services/playable-content-import/import.providers';
import { OrganizationIdentifier } from '../../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import { QuizManagementRepositoryProvider } from '../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { QuizQuestionRepositoryProvider } from '../../../../domain/game/types/quiz/ports/quiz-question.repository';
import { SelectableOptionPolicy } from '../../../../domain/game/types/shared/services/selectable-option-policy';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import { PrismaQuizManagementRepository } from '../../../../infrastructure/game/types/quiz/prisma-quiz-management.repository';
import { PrismaQuizQuestionRepository } from '../../../../infrastructure/game/types/quiz/prisma-quiz-question.repository';
import { PrismaSelectableOptionMapper } from '../../../../infrastructure/game/types/shared/prisma-selectable-option-mapper';
import { PrismaOrganizationMemberRepository } from '../../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaProjectRepository } from '../../../../infrastructure/project/repositories/prisma-project-repository';
import { QuizManagementResolver } from '../../../../presentation/game/types/quiz/graphql/quiz-management-resolver';
import { PlayableContentUploadReader } from '../../../../presentation/game/types/shared/graphql/playable-content-upload-reader';
import { SelectableOptionInputMapper } from '../../../../presentation/game/types/shared/graphql/selectable-option-input-mapper';
import { DatabaseModule } from '../../database/database-module';
import { IdentityModule } from '../../identity/identity-module';
import { SharedServicesModule } from '../../shared/shared-services.module';

@Module({
  imports: [DatabaseModule, IdentityModule, SharedServicesModule],
  providers: [
    CreateQuizUseCase,
    CreateQuizFromImportUseCase,
    UpdateQuizUseCase,
    DeleteQuizUseCase,
    GetQuizUseCase,
    CreateQuizQuestionUseCase,
    ListQuizQuestionsUseCase,
    QuizImportQuestionMapper,
    QuizQuestionIdentifier,
    QuizSelectableOptionIdentifier,
    UpdateQuizQuestionUseCase,
    DeleteQuizQuestionUseCase,
    GameIdentifier,
    GameTypeIdentifier,
    ...playableContentImportProviders,
    GameTypeManagementAccessGuard,
    OrganizationIdentifier,
    OrganizationMemberIdentifier,
    PrismaOrganizationMemberRepository,
    PrismaProjectRepository,
    PrismaQuizManagementRepository,
    PrismaQuizQuestionRepository,
    PrismaSelectableOptionMapper,
    ProjectIdentifier,
    QuizManagementResolver,
    PlayableContentUploadReader,
    SelectableOptionInputMapper,
    SelectableOptionPolicy,
    {
      provide: QuizManagementRepositoryProvider,
      useExisting: PrismaQuizManagementRepository,
    },
    {
      provide: QuizQuestionRepositoryProvider,
      useExisting: PrismaQuizQuestionRepository,
    },
    {
      provide: OrganizationMemberRepositoryProvider,
      useExisting: PrismaOrganizationMemberRepository,
    },
    {
      provide: ProjectRepositoryProvider,
      useExisting: PrismaProjectRepository,
    },
  ],
})
export class QuizModule {}
