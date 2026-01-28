import { inject, injectable } from 'inversify';
import type { Organization } from '../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../domains/organization/entities/organization-dashboard';
import type { Project } from '../../../../domains/project/entities/project';
import {
  WORKSPACE_SELECTION_PORT,
  type WorkspaceSelectionPort,
} from '../../contracts/workspace-selection.port';
import { DashboardReadFacade } from './dashboard-read.facade';

interface DashboardOrganizationSelection {
  readonly organizations: Organization[];
  readonly organizationId: number | null;
}

interface DashboardOrganizationWorkspace {
  readonly organizationDashboard: OrganizationDashboard | null;
  readonly projects: Project[];
  readonly projectId: number | null;
}

export interface DashboardWorkspaceGateway {
  loadOrganizationSelection(): Promise<DashboardOrganizationSelection>;
  loadOrganizationWorkspace(organizationId: number | null): Promise<DashboardOrganizationWorkspace>;
  setOrganizationSelection(organizationId: number | null): void;
  setProjectSelection(projectId: number | null): void;
}

@injectable()
export class DashboardWorkspaceFacade implements DashboardWorkspaceGateway {
  constructor(
    @inject(DashboardReadFacade)
    private readonly dashboardReadFacade: DashboardReadFacade,
    @inject(WORKSPACE_SELECTION_PORT)
    private readonly workspaceSelection: WorkspaceSelectionPort,
  ) {}

  async loadOrganizationSelection(): Promise<DashboardOrganizationSelection> {
    const organizations = await this.dashboardReadFacade.loadOrganizations();
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

  async loadOrganizationWorkspace(
    organizationId: number | null,
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
      this.dashboardReadFacade.loadOrganizationDashboard(organizationId),
      this.dashboardReadFacade.loadProjectsByOrganization(organizationId),
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

  setOrganizationSelection(organizationId: number | null): void {
    this.workspaceSelection.setOrganizationId(organizationId);
    this.workspaceSelection.setProjectId(null);
  }

  setProjectSelection(projectId: number | null): void {
    this.workspaceSelection.setProjectId(projectId);
  }
}
