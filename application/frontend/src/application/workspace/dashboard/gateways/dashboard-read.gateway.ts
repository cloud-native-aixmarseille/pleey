import type { DashboardGameListItem } from '../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardGameListPage } from '../../../../domains/game-catalog/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../../domains/game-catalog/entities/dashboard-game-list-query';
import type { DashboardActiveSessionItem } from '../../../../domains/game-session/entities/active-game-session';
import type { Organization } from '../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../domains/organization/entities/organization-dashboard';
import type { Project } from '../../../../domains/project/entities/project';

export interface DashboardReadGateway {
  createGameSession(gameId: number): Promise<DashboardActiveSessionItem>;
  loadActiveSessions(): Promise<DashboardActiveSessionItem[]>;
  leaveCurrentPlayerSession(): Promise<boolean>;
  loadOrganizations(): Promise<Organization[]>;
  loadOrganizationDashboard(organizationId: number): Promise<OrganizationDashboard>;
  loadProjectsByOrganization(organizationId: number): Promise<Project[]>;
  loadProjectDashboardGames(query: DashboardGameListQuery): Promise<DashboardGameListPage>;
  loadProjectGames(projectId: number): Promise<DashboardGameListItem[]>;
  resumeGameSession(sessionId: number): Promise<DashboardActiveSessionItem>;
  stopGameSession(sessionId: number): Promise<DashboardActiveSessionItem>;
}
