import { describe, expect, it, vi } from 'vitest';
import { DashboardHomeScreenFixtureFactory } from '../../../../test-utils/factories/dashboard-home-screen-fixture-factory';
import { DashboardHomeActionsFacade } from './dashboard-home-actions.facade';

describe('DashboardHomeActionsFacade', () => {
  const dashboardHomeScreenFixtureFactory = new DashboardHomeScreenFixtureFactory();

  it('launches a session and resolves the entry route', async () => {
    const session = dashboardHomeScreenFixtureFactory.createActiveSession({ pin: 'ab12cd' });
    const dashboardReadFacade = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
      createGameSession: vi.fn().mockResolvedValue(session),
    });
    const dashboardGameTypeRegistry = {
      resolveManagementRoute: vi.fn(),
    } as unknown as import('../../../game-catalog/services/game-type-management-registry').GameTypeManagementRegistry;
    const gameSessionRoutingGateway = {
      resolveEntryRoute: vi.fn().mockReturnValue('/game/AB12CD/stage/1'),
    } as unknown as import('../../../game-session/live/shared/gateways/game-session-routing.gateway').GameSessionRoutingGateway;
    const facade = new DashboardHomeActionsFacade(
      dashboardReadFacade as never,
      dashboardGameTypeRegistry,
      gameSessionRoutingGateway,
    );

    await expect(facade.launchSessionRoute(session.gameId)).resolves.toBe('/game/AB12CD/stage/1');
    expect(dashboardReadFacade.createGameSession).toHaveBeenCalledWith(session.gameId);
    expect(gameSessionRoutingGateway.resolveEntryRoute).toHaveBeenCalledWith(session);
  });

  it('delegates manage-game route resolution to the game type registry', () => {
    const dashboardReadFacade = dashboardHomeScreenFixtureFactory.createDashboardReadGateway();
    const dashboardGameTypeRegistry = {
      resolveManagementRoute: vi.fn().mockReturnValue('/quizzes/12'),
    } as unknown as import('../../../game-catalog/services/game-type-management-registry').GameTypeManagementRegistry;
    const gameSessionRoutingGateway = {
      resolveEntryRoute: vi.fn(),
    } as unknown as import('../../../game-session/live/shared/gateways/game-session-routing.gateway').GameSessionRoutingGateway;
    const facade = new DashboardHomeActionsFacade(
      dashboardReadFacade as never,
      dashboardGameTypeRegistry,
      gameSessionRoutingGateway,
    );

    expect(facade.resolveManageGameRoute({ type: 'quiz', relatedGameId: 12 } as never)).toBe(
      '/quizzes/12',
    );
    expect(dashboardGameTypeRegistry.resolveManagementRoute).toHaveBeenCalledWith({
      type: 'quiz',
      relatedGameId: 12,
    });
  });
});
