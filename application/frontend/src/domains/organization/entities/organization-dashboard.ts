export interface OrganizationDashboard {
  readonly organization: {
    readonly id: number;
    readonly name: string;
    readonly description: string | null;
  };
  readonly stats: {
    readonly totalGames: number;
    readonly totalGameSessions: number;
    readonly activeGameSessions: number;
    readonly totalMembers: number;
    readonly totalProjects: number;
  };
}
