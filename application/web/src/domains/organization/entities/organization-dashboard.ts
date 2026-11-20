import type { Organization } from './organization';

export interface OrganizationDashboard {
  readonly organization: Pick<Organization, 'id' | 'name' | 'description' | 'role' | 'permissions' | 'assignableRoles'>;
  readonly stats: {
    readonly totalGames: number;
    readonly totalMembers: number;
    readonly totalProjects: number;
  };
}
