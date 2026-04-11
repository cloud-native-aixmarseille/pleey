import { inject, injectable } from 'inversify';
import type { GameId } from '../../../../domains/game/entities/game';
import type { DashboardGameListPage } from '../../../../domains/game/management/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../../domains/game/management/entities/dashboard-game-list-query';
import type { Party } from '../../../../domains/game/party/shared/entities/party';
import type {
  Organization,
  OrganizationId,
} from '../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../domains/organization/entities/organization-dashboard';
import type { Project, ProjectId } from '../../../../domains/project/entities/project';
import { ListProjectGamesUseCase } from '../../../game/management/use-cases/list-project-games-use-case';
import { CreatePartyUseCase } from '../../../game/party/host/use-cases/create-party-use-case';
import { ListPartiesUseCase } from '../../../game/party/host/use-cases/list-parties-use-case';
import {
  WORKSPACE_SELECTION_PORT,
  type WorkspaceSelectionPort,
} from '../../contracts/workspace-selection.port';
import { GetOrganizationDashboardUseCase } from '../../organizations/use-cases/get-organization-dashboard-use-case';
import { ListMyOrganizationsUseCase } from '../../organizations/use-cases/list-my-organizations-use-case';
import { ListOrganizationProjectsUseCase } from '../../projects/use-cases/list-organization-projects-use-case';

interface DashboardOrganizationSelection {
  readonly organizations: Organization[];
  readonly organizationId: OrganizationId | null;
}

interface DashboardOrganizationWorkspace {
  readonly organizationDashboard: OrganizationDashboard | null;
  readonly projects: Project[];
  readonly projectId: ProjectId | null;
}

export interface DashboardWorkspaceGateway {
  loadProjectGameCatalog(query: DashboardGameListQuery): Promise<DashboardGameListPage>;
  loadUserParties(): Promise<readonly Party[]>;
  createParty(gameId: GameId): Promise<Party>;
  restoreOrganizationSelection(): Promise<DashboardOrganizationSelection>;
  loadOrganizationWorkspaceState(
    organizationId: OrganizationId | null,
  ): Promise<DashboardOrganizationWorkspace>;
  setOrganizationSelection(organizationId: OrganizationId | null): void;
  setProjectSelection(projectId: ProjectId | null): void;
}

@injectable()
export class DashboardWorkspaceFacade implements DashboardWorkspaceGateway {
  constructor(
    @inject(ListProjectGamesUseCase)
    private readonly listProjectGamesUseCase: ListProjectGamesUseCase,
    @inject(ListPartiesUseCase)
    private readonly listPartiesUseCase: ListPartiesUseCase,
    @inject(CreatePartyUseCase)
    private readonly createPartyUseCase: CreatePartyUseCase,
    @inject(ListMyOrganizationsUseCase)
    private readonly listMyOrganizationsUseCase: ListMyOrganizationsUseCase,
    @inject(GetOrganizationDashboardUseCase)
    private readonly getOrganizationDashboardUseCase: GetOrganizationDashboardUseCase,
    @inject(ListOrganizationProjectsUseCase)
    private readonly listOrganizationProjectsUseCase: ListOrganizationProjectsUseCase,
    @inject(WORKSPACE_SELECTION_PORT)
    private readonly workspaceSelection: WorkspaceSelectionPort,
  ) {}

  loadProjectGameCatalog(query: DashboardGameListQuery): Promise<DashboardGameListPage> {
    return this.listProjectGamesUseCase.execute(query);
  }

  loadUserParties(): Promise<readonly Party[]> {
    return this.listPartiesUseCase.execute();
  }

  createParty(gameId: GameId): Promise<Party> {
    return this.createPartyUseCase.execute({ gameId });
  }

  async restoreOrganizationSelection(): Promise<DashboardOrganizationSelection> {
    const organizations = await this.listMyOrganizationsUseCase.execute();
    const restoredSelection = this.workspaceSelection.restoreSelection();
    const restoredOrganization = organizations.find(
      (organization) => organization.id === restoredSelection.organizationId,
    );
    const nextOrganizationId = restoredOrganization?.id ?? organizations[0]?.id ?? null;

    this.workspaceSelection.setOrganizationId(nextOrganizationId);

    if (nextOrganizationId === null) {
      this.workspaceSelection.setProjectId(null);
    }

    return {
      organizations,
      organizationId: nextOrganizationId,
    };
  }

  async loadOrganizationWorkspaceState(
    organizationId: OrganizationId | null,
  ): Promise<DashboardOrganizationWorkspace> {
    if (organizationId === null) {
      this.workspaceSelection.setProjectId(null);

      return {
        organizationDashboard: null,
        projects: [],
        projectId: null,
      };
    }

    const [organizationDashboard, projects] = await Promise.all([
      this.getOrganizationDashboardUseCase.execute({ organizationId }),
      this.listOrganizationProjectsUseCase.execute({ organizationId }),
    ]);

    const restoredSelection = this.workspaceSelection.restoreSelection();
    const restoredProject = projects.find((project) => project.id === restoredSelection.projectId);
    const nextProjectId = restoredProject?.id ?? projects[0]?.id ?? null;

    this.workspaceSelection.setProjectId(nextProjectId);

    return {
      organizationDashboard,
      projects,
      projectId: nextProjectId,
    };
  }

  setOrganizationSelection(organizationId: OrganizationId | null): void {
    this.workspaceSelection.setOrganizationId(organizationId);
    this.workspaceSelection.setProjectId(null);
  }

  setProjectSelection(projectId: ProjectId | null): void {
    this.workspaceSelection.setProjectId(projectId);
  }
}
