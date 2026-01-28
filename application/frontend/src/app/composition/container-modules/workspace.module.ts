import { ContainerModule } from 'inversify';
import { GameTypeManagementRegistry } from '../../../application/game-catalog/services/game-type-management-registry';
import type { RouteFactory } from '../../../application/shared/contracts/routing.port';
import {
  WORKSPACE_SELECTION_PORT,
  type WorkspaceSelectionPort,
} from '../../../application/workspace/contracts/workspace-selection.port';
import { DASHBOARD_SERVICE_ID } from '../../../application/workspace/dashboard/contracts/dashboard-service-id';
import { DashboardHomeActionsFacade } from '../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import { DashboardReadFacade } from '../../../application/workspace/dashboard/facades/dashboard-read.facade';
import { DashboardWorkspaceFacade } from '../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import { ListProjectDashboardGamesUseCase } from '../../../application/workspace/dashboard/use-cases/list-project-dashboard-games-use-case';
import { ORGANIZATION_SERVICE_ID } from '../../../application/workspace/organizations/contracts/organization-service-id';
import { OrganizationFormFacade } from '../../../application/workspace/organizations/facades/organization-form.facade';
import { OrganizationManagementFacade } from '../../../application/workspace/organizations/facades/organization-management.facade';
import { CreateOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/create-organization-use-case';
import { GetOrganizationDashboardUseCase } from '../../../application/workspace/organizations/use-cases/get-organization-dashboard-use-case';
import { ListMyOrganizationsUseCase } from '../../../application/workspace/organizations/use-cases/list-my-organizations-use-case';
import { PROJECT_SERVICE_ID } from '../../../application/workspace/projects/contracts/project-service-id';
import { ProjectFormFacade } from '../../../application/workspace/projects/facades/project-form.facade';
import { CreateProjectUseCase } from '../../../application/workspace/projects/use-cases/create-project-use-case';
import { DeleteProjectUseCase } from '../../../application/workspace/projects/use-cases/delete-project-use-case';
import { ListOrganizationProjectsUseCase } from '../../../application/workspace/projects/use-cases/list-organization-projects-use-case';
import { UpdateProjectUseCase } from '../../../application/workspace/projects/use-cases/update-project-use-case';
import type { DashboardGameRepository } from '../../../domains/game-catalog/ports/dashboard-game-repository';
import { OrganizationFormService } from '../../../domains/organization/services/organization-form.service';
import { ProjectFormService } from '../../../domains/project/services/project-form.service';
import { GraphqlDashboardGameRepository } from '../../../infrastructure/dashboard/graphql-dashboard-game.repository';
import { GraphqlOrganizationRepository } from '../../../infrastructure/organization/graphql-organization.repository';
import { GraphqlProjectRepository } from '../../../infrastructure/project/graphql-project.repository';
import { DashboardRoutesFactory } from '../../../presentation/workspace/dashboard/routes/dashboard-routes-factory';
import { OrganizationRoutesFactory } from '../../../presentation/workspace/organizations/routes/organization-routes-factory';
import { AppPersistedWorkspaceSelectionRuntime } from '../../workspace/runtimes/app-persisted-workspace-selection-runtime';
import { TOKENS } from '../tokens';

export const workspaceModule = new ContainerModule(({ bind }) => {
  bind<WorkspaceSelectionPort>(WORKSPACE_SELECTION_PORT)
    .to(AppPersistedWorkspaceSelectionRuntime)
    .inSingletonScope();

  bind(GameTypeManagementRegistry).toSelf().inSingletonScope();
  bind(ListProjectDashboardGamesUseCase).toSelf().inSingletonScope();
  bind(GraphqlDashboardGameRepository).toSelf().inSingletonScope();
  bind<DashboardGameRepository>(DASHBOARD_SERVICE_ID.dashboardGameRepository).toService(
    GraphqlDashboardGameRepository,
  );
  bind(DashboardReadFacade).toSelf().inSingletonScope();
  bind(DashboardHomeActionsFacade).toSelf().inSingletonScope();
  bind(DashboardWorkspaceFacade).toSelf().inSingletonScope();
  bind(DashboardRoutesFactory).toSelf().inSingletonScope();

  bind(CreateOrganizationUseCase).toSelf().inSingletonScope();
  bind(GetOrganizationDashboardUseCase).toSelf().inSingletonScope();
  bind(ListMyOrganizationsUseCase).toSelf().inSingletonScope();
  bind(OrganizationFormService).toSelf().inSingletonScope();
  bind(OrganizationFormFacade).toSelf().inSingletonScope();
  bind(CreateProjectUseCase).toSelf().inSingletonScope();
  bind(UpdateProjectUseCase).toSelf().inSingletonScope();
  bind(DeleteProjectUseCase).toSelf().inSingletonScope();
  bind(ListOrganizationProjectsUseCase).toSelf().inSingletonScope();
  bind(ProjectFormService).toSelf().inSingletonScope();
  bind(ProjectFormFacade).toSelf().inSingletonScope();
  bind(OrganizationManagementFacade).toSelf().inSingletonScope();
  bind(ORGANIZATION_SERVICE_ID.organizationRepository)
    .to(GraphqlOrganizationRepository)
    .inSingletonScope();
  bind(PROJECT_SERVICE_ID.projectRepository).to(GraphqlProjectRepository).inSingletonScope();
  bind(OrganizationRoutesFactory).toSelf().inSingletonScope();

  bind<RouteFactory>(TOKENS.routeFactory).toService(DashboardRoutesFactory);
  bind<RouteFactory>(TOKENS.routeFactory).toService(OrganizationRoutesFactory);
});
