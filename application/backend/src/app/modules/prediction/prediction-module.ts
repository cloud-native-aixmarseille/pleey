import { Module } from '@nestjs/common';
import { CreatePredictionGameUseCase } from '../../../application/prediction-management/use-cases/create-prediction-game-use-case';
import { CreatePredictionPromptUseCase } from '../../../application/prediction-management/use-cases/create-prediction-prompt-use-case';
import { DeletePredictionPromptUseCase } from '../../../application/prediction-management/use-cases/delete-prediction-prompt-use-case';
import { ListPredictionPromptsUseCase } from '../../../application/prediction-management/use-cases/list-prediction-prompts-use-case';
import { ListProjectPredictionGamesUseCase } from '../../../application/prediction-management/use-cases/list-project-prediction-games-use-case';
import { UpdatePredictionPromptUseCase } from '../../../application/prediction-management/use-cases/update-prediction-prompt-use-case';
import { GameRepositoryProvider } from '../../../domain/game/ports/repositories/game.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { PredictionRepositoryProvider } from '../../../domain/prediction/ports/prediction.repository';
import { PredictionPromptRepositoryProvider } from '../../../domain/prediction/ports/prediction-prompt.repository';
import { PredictionOptionService } from '../../../domain/prediction/services/prediction-option-service';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { PrismaGameRepository } from '../../../infrastructure/game/repositories/prisma-game-repository';
import { PrismaOrganizationMemberRepository } from '../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaPredictionPromptRepository } from '../../../infrastructure/prediction/repositories/prisma-prediction-prompt-repository';
import { PrismaPredictionRepository } from '../../../infrastructure/prediction/repositories/prisma-prediction-repository';
import { PrismaProjectRepository } from '../../../infrastructure/project/repositories/prisma-project-repository';
import { PredictionResolver } from '../../../presentation/prediction-management/graphql/prediction-resolver';
import { AuthModule } from '../auth/auth-module';
import { DatabaseModule } from '../database/database-module';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    PrismaGameRepository,
    PrismaOrganizationMemberRepository,
    PrismaProjectRepository,
    PrismaPredictionRepository,
    PrismaPredictionPromptRepository,
    {
      provide: GameRepositoryProvider,
      useExisting: PrismaGameRepository,
    },
    {
      provide: OrganizationMemberRepositoryProvider,
      useExisting: PrismaOrganizationMemberRepository,
    },
    {
      provide: ProjectRepositoryProvider,
      useExisting: PrismaProjectRepository,
    },
    {
      provide: PredictionRepositoryProvider,
      useExisting: PrismaPredictionRepository,
    },
    {
      provide: PredictionPromptRepositoryProvider,
      useExisting: PrismaPredictionPromptRepository,
    },
    PredictionOptionService,
    CreatePredictionGameUseCase,
    ListProjectPredictionGamesUseCase,
    CreatePredictionPromptUseCase,
    UpdatePredictionPromptUseCase,
    DeletePredictionPromptUseCase,
    ListPredictionPromptsUseCase,
    PredictionResolver,
  ],
})
export class PredictionModule {}
