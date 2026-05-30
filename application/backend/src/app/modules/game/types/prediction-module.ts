import { Module } from '@nestjs/common';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { PredictionPromptIdentifier } from '../../../../application/game/types/prediction/services/prediction-prompt-identifier';
import { PredictionSelectableOptionIdentifier } from '../../../../application/game/types/prediction/services/prediction-selectable-option-identifier';
import { CreatePredictionPromptUseCase } from '../../../../application/game/types/prediction/use-cases/create-prediction-prompt-use-case';
import { CreatePredictionUseCase } from '../../../../application/game/types/prediction/use-cases/create-prediction-use-case';
import { DeletePredictionPromptUseCase } from '../../../../application/game/types/prediction/use-cases/delete-prediction-prompt-use-case';
import { DeletePredictionUseCase } from '../../../../application/game/types/prediction/use-cases/delete-prediction-use-case';
import { GetPredictionUseCase } from '../../../../application/game/types/prediction/use-cases/get-prediction-use-case';
import { ImportPredictionPromptsUseCase } from '../../../../application/game/types/prediction/use-cases/import-prediction-prompts-use-case';
import { ListPredictionPromptsUseCase } from '../../../../application/game/types/prediction/use-cases/list-prediction-prompts-use-case';
import { UpdatePredictionPromptUseCase } from '../../../../application/game/types/prediction/use-cases/update-prediction-prompt-use-case';
import { UpdatePredictionUseCase } from '../../../../application/game/types/prediction/use-cases/update-prediction-use-case';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { GameTypeManagementAccessGuard } from '../../../../application/game/types/shared/services/game-type-management-access-guard';
import { PlayableContentImportParser } from '../../../../application/game/types/shared/services/playable-content-import-parser';
import { OrganizationIdentifier } from '../../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import { PredictionManagementRepositoryProvider } from '../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionPromptRepositoryProvider } from '../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import { SelectableOptionPolicy } from '../../../../domain/game/types/shared/services/selectable-option-policy';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import { PrismaPredictionManagementRepository } from '../../../../infrastructure/game/types/prediction/prisma-prediction-management.repository';
import { PrismaPredictionPromptRepository } from '../../../../infrastructure/game/types/prediction/prisma-prediction-prompt.repository';
import { PrismaSelectableOptionMapper } from '../../../../infrastructure/game/types/shared/prisma-selectable-option-mapper';
import { PrismaOrganizationMemberRepository } from '../../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaProjectRepository } from '../../../../infrastructure/project/repositories/prisma-project-repository';
import { PredictionManagementResolver } from '../../../../presentation/game/types/prediction/graphql/prediction-management-resolver';
import { SelectableOptionInputMapper } from '../../../../presentation/game/types/shared/graphql/selectable-option-input-mapper';
import { DatabaseModule } from '../../database/database-module';
import { IdentityModule } from '../../identity/identity-module';

@Module({
  imports: [DatabaseModule, IdentityModule],
  providers: [
    CreatePredictionUseCase,
    UpdatePredictionUseCase,
    DeletePredictionUseCase,
    GetPredictionUseCase,
    CreatePredictionPromptUseCase,
    ImportPredictionPromptsUseCase,
    ListPredictionPromptsUseCase,
    PredictionPromptIdentifier,
    PredictionSelectableOptionIdentifier,
    UpdatePredictionPromptUseCase,
    DeletePredictionPromptUseCase,
    GameIdentifier,
    GameTypeIdentifier,
    PlayableContentImportParser,
    GameTypeManagementAccessGuard,
    OrganizationIdentifier,
    OrganizationMemberIdentifier,
    PredictionManagementResolver,
    PrismaOrganizationMemberRepository,
    PrismaPredictionManagementRepository,
    PrismaPredictionPromptRepository,
    PrismaProjectRepository,
    PrismaSelectableOptionMapper,
    ProjectIdentifier,
    SelectableOptionPolicy,
    SelectableOptionInputMapper,
    {
      provide: PredictionManagementRepositoryProvider,
      useExisting: PrismaPredictionManagementRepository,
    },
    {
      provide: PredictionPromptRepositoryProvider,
      useExisting: PrismaPredictionPromptRepository,
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
export class PredictionModule {}
