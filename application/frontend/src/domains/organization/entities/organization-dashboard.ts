import type { OrganizationId } from './organization';

export interface OrganizationDashboard {
  readonly organization: {
    readonly id: OrganizationId;
    readonly name: string;
    readonly description: string | null;
  };
  readonly stats: {
    readonly totalGames: number;
    readonly totalMembers: number;
    readonly totalProjects: number;
  };
}
