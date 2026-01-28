import { inject, injectable } from 'inversify';
import type { DashboardGameListItem } from '../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardGameListPage } from '../../../../domains/game-catalog/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../../domains/game-catalog/entities/dashboard-game-list-query';
import type { DashboardActiveSessionItem } from '../../../../domains/game-session/entities/active-game-session';
import type { GameSessionRepository } from '../../../../domains/game-session/ports/game-session-repository';
import type { Organization } from '../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../domains/organization/entities/organization-dashboard';
import type { Project } from '../../../../domains/project/entities/project';
import { GameTypeManagementRegistry } from '../../../game-catalog/services/game-type-management-registry';
import { GAME_SERVICE_ID } from '../../../game-session/live/shared/contracts/game-session-service-id';
import { CreateHostSessionUseCase } from '../../../game-session/management/use-cases/create-host-session-use-case';
import { GetCurrentPlayerSessionUseCase } from '../../../game-session/management/use-cases/get-current-player-session-use-case';
import { LeaveCurrentPlayerSessionUseCase } from '../../../game-session/management/use-cases/leave-current-player-session-use-case';
import { ListActiveHostSessionsUseCase } from '../../../game-session/management/use-cases/list-active-host-sessions-use-case';
import { GetOrganizationDashboardUseCase } from '../../organizations/use-cases/get-organization-dashboard-use-case';
import { ListMyOrganizationsUseCase } from '../../organizations/use-cases/list-my-organizations-use-case';
import { ListOrganizationProjectsUseCase } from '../../projects/use-cases/list-organization-projects-use-case';
import type { DashboardReadGateway } from '../gateways/dashboard-read.gateway';
import { ListProjectDashboardGamesUseCase } from '../use-cases/list-project-dashboard-games-use-case';

@injectable()
export class DashboardReadFacade implements DashboardReadGateway {
  constructor(
    @inject(CreateHostSessionUseCase)
    private readonly createHostSessionUseCase: CreateHostSessionUseCase,
    @inject(ListActiveHostSessionsUseCase)
    private readonly listActiveHostSessionsUseCase: ListActiveHostSessionsUseCase,
    @inject(GetCurrentPlayerSessionUseCase)
    private readonly getCurrentPlayerSessionUseCase: GetCurrentPlayerSessionUseCase,
    @inject(LeaveCurrentPlayerSessionUseCase)
    private readonly leaveCurrentPlayerSessionUseCase: LeaveCurrentPlayerSessionUseCase,
    @inject(ListMyOrganizationsUseCase)
    private readonly listMyOrganizationsUseCase: ListMyOrganizationsUseCase,
    @inject(GetOrganizationDashboardUseCase)
    private readonly getOrganizationDashboardUseCase: GetOrganizationDashboardUseCase,
    @inject(ListOrganizationProjectsUseCase)
    private readonly listOrganizationProjectsUseCase: ListOrganizationProjectsUseCase,
    @inject(ListProjectDashboardGamesUseCase)
    private readonly listProjectDashboardGamesUseCase: ListProjectDashboardGamesUseCase,
    @inject(GAME_SERVICE_ID.gameSessionRepository)
    private readonly gameSessionRepository: GameSessionRepository,
    @inject(GameTypeManagementRegistry)
    private readonly dashboardGameTypeRegistry: GameTypeManagementRegistry,
  ) {}

  createGameSession(gameId: number): Promise<DashboardActiveSessionItem> {
    return this.createHostSessionUseCase.execute({ gameId });
  }

  async loadActiveSessions(): Promise<DashboardActiveSessionItem[]> {
    const [hostSessions, currentPlayerSession] = await Promise.all([
      this.listActiveHostSessionsUseCase.execute(),
      this.getCurrentPlayerSessionUseCase.execute(),
    ]);

    if (!currentPlayerSession) {
      return hostSessions;
    }

    const hasMatchingHostSession = hostSessions.some(
      (hostSession) =>
        hostSession.sessionId === currentPlayerSession.sessionId ||
        hostSession.pin === currentPlayerSession.pin,
    );

    if (hasMatchingHostSession) {
      return hostSessions;
    }

    return [currentPlayerSession, ...hostSessions];
  }

  leaveCurrentPlayerSession(): Promise<boolean> {
    return this.leaveCurrentPlayerSessionUseCase.execute();
  }

  loadOrganizations(): Promise<Organization[]> {
    return this.listMyOrganizationsUseCase.execute();
  }

  loadOrganizationDashboard(organizationId: number): Promise<OrganizationDashboard> {
    return this.getOrganizationDashboardUseCase.execute({ organizationId });
  }

  loadProjectsByOrganization(organizationId: number): Promise<Project[]> {
    return this.listOrganizationProjectsUseCase.execute({ organizationId });
  }

  loadProjectDashboardGames(query: DashboardGameListQuery): Promise<DashboardGameListPage> {
    return this.listProjectDashboardGamesUseCase.execute(query);
  }

  loadProjectGames(projectId: number): Promise<DashboardGameListItem[]> {
    return this.dashboardGameTypeRegistry.listGames(projectId);
  }

  resumeGameSession(sessionId: number): Promise<DashboardActiveSessionItem> {
    return this.gameSessionRepository.resumeGameSession(sessionId);
  }

  stopGameSession(sessionId: number): Promise<DashboardActiveSessionItem> {
    return this.gameSessionRepository.stopGameSession(sessionId);
  }
}
