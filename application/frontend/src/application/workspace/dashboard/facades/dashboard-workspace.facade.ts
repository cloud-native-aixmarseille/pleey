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
import type { PaginatedResult } from '../../../../domains/shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../../../domains/shared/value-objects/pagination-query';
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

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;

interface DashboardOrganizationWorkspaceQuery extends PaginationQuery {
  readonly organizationId: OrganizationId | null;
}

interface DashboardOrganizationProjectsPageQuery extends PaginationQuery {
  readonly organizationId: OrganizationId;
}

interface DashboardOrganizationSelection {
  readonly organizationsPage: PaginatedResult<Organization>;
  readonly organizationId: OrganizationId | null;
}

interface DashboardOrganizationWorkspace {
  readonly organizationDashboard: OrganizationDashboard | null;
  readonly projectsPage: PaginatedResult<Project>;
  readonly projectId: ProjectId | null;
}

function createEmptyPage<TItem>(
  page: number = DEFAULT_PAGE,
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginatedResult<TItem> {
  return {
    items: [],
    totalCount: 0,
    overallCount: 0,
    page,
    pageSize,
    totalPages: 1,
  };
}

export interface DashboardWorkspaceGateway {
  loadProjectGameCatalog(query: DashboardGameListQuery): Promise<DashboardGameListPage>;
  loadUserParties(): Promise<readonly Party[]>;
  createParty(gameId: GameId): Promise<Party>;
  loadOrganizationsPage(query?: PaginationQuery): Promise<PaginatedResult<Organization>>;
  restoreOrganizationSelection(query?: PaginationQuery): Promise<DashboardOrganizationSelection>;
  loadOrganizationProjectsPage(
    query: DashboardOrganizationProjectsPageQuery,
  ): Promise<PaginatedResult<Project>>;
  loadOrganizationWorkspaceState(
    query: DashboardOrganizationWorkspaceQuery,
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

  loadOrganizationsPage(query: PaginationQuery = {}): Promise<PaginatedResult<Organization>> {
    return this.listMyOrganizationsUseCase.execute({
      page: query.page ?? DEFAULT_PAGE,
      pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
      search: query.search,
    });
  }

  async restoreOrganizationSelection(
    query: PaginationQuery = {},
  ): Promise<DashboardOrganizationSelection> {
    const organizationsPage = await this.listMyOrganizationsUseCase.execute({
      page: query.page ?? DEFAULT_PAGE,
      pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
      search: query.search,
    });
    const organizations = [...organizationsPage.items];
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
      organizationsPage,
      organizationId: nextOrganizationId,
    };
  }

  loadOrganizationProjectsPage(
    query: DashboardOrganizationProjectsPageQuery,
  ): Promise<PaginatedResult<Project>> {
    return this.listOrganizationProjectsUseCase.execute({
      organizationId: query.organizationId,
      page: query.page ?? DEFAULT_PAGE,
      pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
      search: query.search,
    });
  }

  async loadOrganizationWorkspaceState(
    query: DashboardOrganizationWorkspaceQuery,
  ): Promise<DashboardOrganizationWorkspace> {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    if (query.organizationId === null) {
      this.workspaceSelection.setProjectId(null);

      return {
        organizationDashboard: null,
        projectsPage: createEmptyPage(page, pageSize),
        projectId: null,
      };
    }

    const organizationId = query.organizationId;

    const [organizationDashboard, projectsPage] = await Promise.all([
      this.getOrganizationDashboardUseCase.execute({ organizationId }),
      this.listOrganizationProjectsUseCase.execute({
        organizationId,
        page,
        pageSize,
        search: query.search,
      }),
    ]);
    const projects = [...projectsPage.items];

    const restoredSelection = this.workspaceSelection.restoreSelection();
    const restoredProject = projects.find((project) => project.id === restoredSelection.projectId);
    const nextProjectId =
      restoredProject?.id ??
      (query.search ? restoredSelection.projectId : null) ??
      projects[0]?.id ??
      null;

    this.workspaceSelection.setProjectId(nextProjectId);

    return {
      organizationDashboard,
      projectsPage,
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
