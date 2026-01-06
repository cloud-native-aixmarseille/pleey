export interface OrganizationDashboard {
  organization: {
    id: number;
    name: string;
    description: string | null;
  };
  stats: {
    totalQuizzes: number;
    totalGameSessions: number;
    activeGameSessions: number;
    totalMembers: number;
  };
}
