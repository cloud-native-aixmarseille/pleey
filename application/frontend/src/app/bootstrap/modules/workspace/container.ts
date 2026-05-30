import { ContainerModule, injectable } from 'inversify';
import {
  type GameCatalogPort,
  GameCatalogPortToken,
} from '../../../../application/game/management/ports/game-catalog.port';
import { ListProjectGamesUseCase } from '../../../../application/game/management/use-cases/list-project-games-use-case';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { PredictionManagementFacade } from '../../../../application/game/types/prediction/facades/prediction-management.facade';
import { PredictionContentImportExampleFactory } from '../../../../application/game/types/prediction/services/prediction-content-import-example-factory';
import { PredictionGameTypeContributor } from '../../../../application/game/types/prediction/services/prediction-game-type-contributor';
import { PredictionPromptIdentifier } from '../../../../application/game/types/prediction/services/prediction-prompt-identifier';
import { QuizManagementFacade } from '../../../../application/game/types/quiz/facades/quiz-management.facade';
import { QuizGameTypeContributor } from '../../../../application/game/types/quiz/services/quiz-game-type-contributor';
import { QuizQuestionIdentifier } from '../../../../application/game/types/quiz/services/quiz-question-identifier';
import { QuizQuestionImportExampleFactory } from '../../../../application/game/types/quiz/services/quiz-question-import-example-factory';
import type { GameTypeCatalogFactory } from '../../../../application/game/types/shared/contracts/game-type-catalog-factory';
import { GameTypeCatalogFactoryToken } from '../../../../application/game/types/shared/contracts/game-type-catalog-factory';
import {
  type GameTypeContributor,
  GameTypeContributorToken,
} from '../../../../application/game/types/shared/contracts/game-type-contributor';
import { GAME_TYPE_CATALOG_GATEWAY } from '../../../../application/game/types/shared/gateways/game-type-catalog.gateway';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { GameTypeRegistry } from '../../../../application/game/types/shared/services/game-type-registry';
import {
  ROUTE_FACTORY,
  type RouteFactory,
} from '../../../../application/shared/contracts/routing.port';
import {
  WORKSPACE_SELECTION_PORT,
  type WorkspaceSelectionPort,
} from '../../../../application/workspace/contracts/workspace-selection.port';
import { DashboardHomeActionsFacade } from '../../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import { DashboardWorkspaceFacade } from '../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import { OrganizationFormFacade } from '../../../../application/workspace/organizations/facades/organization-form.facade';
import { OrganizationManagementFacade } from '../../../../application/workspace/organizations/facades/organization-management.facade';
import { CreateOrganizationUseCase } from '../../../../application/workspace/organizations/use-cases/create-organization-use-case';
import { GetOrganizationDashboardUseCase } from '../../../../application/workspace/organizations/use-cases/get-organization-dashboard-use-case';
import { ListMyOrganizationsUseCase } from '../../../../application/workspace/organizations/use-cases/list-my-organizations-use-case';
import { ProjectFormFacade } from '../../../../application/workspace/projects/facades/project-form.facade';
import { CreateProjectUseCase } from '../../../../application/workspace/projects/use-cases/create-project-use-case';
import { DeleteProjectUseCase } from '../../../../application/workspace/projects/use-cases/delete-project-use-case';
import { ListOrganizationProjectsUseCase } from '../../../../application/workspace/projects/use-cases/list-organization-projects-use-case';
import { UpdateProjectUseCase } from '../../../../application/workspace/projects/use-cases/update-project-use-case';
import { OrganizationIdentifier } from '../../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import { PredictionManagementRepositoryToken } from '../../../../domains/game/types/prediction/ports/prediction-management.repository';
import { QuizManagementRepositoryToken } from '../../../../domains/game/types/quiz/ports/quiz-management.repository';
import {
  type GameTypeCatalog,
  type GameTypeDescriptor,
} from '../../../../domains/game/types/shared/game-type-catalog';
import { StaticGameTypeCatalog } from '../../../../domains/game/types/shared/static-game-type-catalog';
import { OrganizationRepositoryToken } from '../../../../domains/organization/ports/organization-repository';
import { OrganizationFormService } from '../../../../domains/organization/services/organization-form.service';
import { ProjectRepositoryToken } from '../../../../domains/project/ports/project-repository';
import { ProjectFormService } from '../../../../domains/project/services/project-form.service';
import { GraphqlGameCatalogAdapter } from '../../../../infrastructure/game/management/graphql-game-catalog.adapter';
import { GraphqlPredictionManagementRepository } from '../../../../infrastructure/game/types/prediction/graphql-prediction-management.repository';
import { GraphqlQuizManagementRepository } from '../../../../infrastructure/game/types/quiz/graphql-quiz-management.repository';
import { PlayableManagementGraphqlMapper } from '../../../../infrastructure/game/types/shared/playable-management-graphql.mapper';
import { GraphqlOrganizationRepository } from '../../../../infrastructure/organization/graphql-organization.repository';
import { GraphqlProjectRepository } from '../../../../infrastructure/project/graphql-project.repository';
import { PersistedWorkspaceSelectionAdapter } from '../../../../infrastructure/workspace/persisted-workspace-selection.adapter';
import { PredictionManagementRoutesFactory } from '../../../../presentation/game/types/prediction/routes/prediction-management-routes-factory';
import { QuizManagementRoutesFactory } from '../../../../presentation/game/types/quiz/routes/quiz-management-routes-factory';
import { DashboardRoutesFactory } from '../../../../presentation/workspace/dashboard/routes/dashboard-routes-factory';
import { OrganizationRoutesFactory } from '../../../../presentation/workspace/organizations/routes/organization-routes-factory';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppWorkspaceProviderFactory } from './app-workspace-provider-factory';

@injectable()
export class StaticGameTypeCatalogFactory implements GameTypeCatalogFactory {
  create(descriptors: readonly GameTypeDescriptor[]): GameTypeCatalog {
    return new StaticGameTypeCatalog(descriptors);
  }
}

export const workspaceContainerModule = new ContainerModule(({ bind }) => {
  bind(AppWorkspaceProviderFactory).toSelf().inSingletonScope();
  bind(OrganizationIdentifier)
    .toDynamicValue(() => new OrganizationIdentifier())
    .inSingletonScope();
  bind(ProjectIdentifier)
    .toDynamicValue(() => new ProjectIdentifier())
    .inSingletonScope();
  bind(GameIdentifier)
    .toDynamicValue(() => new GameIdentifier())
    .inSingletonScope();
  bind(GameTypeIdentifier)
    .toDynamicValue(() => new GameTypeIdentifier())
    .inSingletonScope();
  bind('ManagementGameTypeIdParser').toService(GameTypeIdentifier);
  bind(PredictionPromptIdentifier)
    .toDynamicValue(() => new PredictionPromptIdentifier())
    .inSingletonScope();
  bind(QuizQuestionIdentifier)
    .toDynamicValue(() => new QuizQuestionIdentifier())
    .inSingletonScope();
  bind(PredictionContentImportExampleFactory).toSelf().inSingletonScope();
  bind(QuizQuestionImportExampleFactory).toSelf().inSingletonScope();
  bind(GraphqlGameCatalogAdapter).toSelf().inSingletonScope();
  bind(GraphqlPredictionManagementRepository).toSelf().inSingletonScope();
  bind(GraphqlQuizManagementRepository).toSelf().inSingletonScope();
  bind(PlayableManagementGraphqlMapper).toSelf().inSingletonScope();
  bind(StaticGameTypeCatalogFactory).toSelf().inSingletonScope();
  bind(GameTypeRegistry).toSelf().inSingletonScope();
  bind(PredictionGameTypeContributor).toSelf().inSingletonScope();
  bind(PredictionManagementFacade).toSelf().inSingletonScope();
  bind(PredictionManagementRoutesFactory).toSelf().inSingletonScope();
  bind(QuizGameTypeContributor).toSelf().inSingletonScope();
  bind(QuizManagementFacade).toSelf().inSingletonScope();
  bind(QuizManagementRoutesFactory).toSelf().inSingletonScope();
  bind(DashboardHomeActionsFacade).toSelf().inSingletonScope();
  bind(DashboardWorkspaceFacade).toSelf().inSingletonScope();
  bind(DashboardRoutesFactory).toSelf().inSingletonScope();
  bind(ListProjectGamesUseCase).toSelf().inSingletonScope();
  bind(CreateOrganizationUseCase).toSelf().inSingletonScope();
  bind(GetOrganizationDashboardUseCase).toSelf().inSingletonScope();
  bind(ListMyOrganizationsUseCase).toSelf().inSingletonScope();
  bind(OrganizationFormService).toSelf().inSingletonScope();
  bind(OrganizationFormFacade).toSelf().inSingletonScope();
  bind(OrganizationManagementFacade).toSelf().inSingletonScope();
  bind(OrganizationRoutesFactory).toSelf().inSingletonScope();
  bind(CreateProjectUseCase).toSelf().inSingletonScope();
  bind(UpdateProjectUseCase).toSelf().inSingletonScope();
  bind(DeleteProjectUseCase).toSelf().inSingletonScope();
  bind(ListOrganizationProjectsUseCase).toSelf().inSingletonScope();
  bind(ProjectFormService).toSelf().inSingletonScope();
  bind(ProjectFormFacade).toSelf().inSingletonScope();
  bind<GameCatalogPort>(GameCatalogPortToken).toService(GraphqlGameCatalogAdapter);
  bind(PredictionManagementRepositoryToken).toService(GraphqlPredictionManagementRepository);
  bind(QuizManagementRepositoryToken).toService(GraphqlQuizManagementRepository);
  bind(GameTypeCatalogFactoryToken).toService(StaticGameTypeCatalogFactory);
  bind(GAME_TYPE_CATALOG_GATEWAY).toService(GameTypeRegistry);
  bind<GameTypeContributor>(GameTypeContributorToken).toService(PredictionGameTypeContributor);
  bind<GameTypeContributor>(GameTypeContributorToken).toService(QuizGameTypeContributor);
  bind(OrganizationRepositoryToken).to(GraphqlOrganizationRepository).inSingletonScope();
  bind(ProjectRepositoryToken).to(GraphqlProjectRepository).inSingletonScope();
  bind<WorkspaceSelectionPort>(WORKSPACE_SELECTION_PORT)
    .to(PersistedWorkspaceSelectionAdapter)
    .inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppWorkspaceProviderFactory);
  bind<RouteFactory>(ROUTE_FACTORY).toService(DashboardRoutesFactory);
  bind<RouteFactory>(ROUTE_FACTORY).toService(PredictionManagementRoutesFactory);
  bind<RouteFactory>(ROUTE_FACTORY).toService(QuizManagementRoutesFactory);
  bind<RouteFactory>(ROUTE_FACTORY).toService(OrganizationRoutesFactory);
});
