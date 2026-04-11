import type { OrganizationId } from '../../../domain/organization/entities/organization';
import type { ProjectId } from '../../../domain/project/entities/project';

export interface OrganizationDashboardGameStats {
  readonly totalGames: number;
  readonly totalParties: number;
  readonly activeParties: number;
}

export abstract class WorkspaceGameManagementPort {
  abstract countProjectGames(projectId: ProjectId): Promise<number>;

  abstract reassignProjectGames(
    sourceProjectId: ProjectId,
    targetProjectId: ProjectId,
  ): Promise<void>;

  abstract getOrganizationDashboardStats(
    organizationId: OrganizationId,
  ): Promise<OrganizationDashboardGameStats>;
}
