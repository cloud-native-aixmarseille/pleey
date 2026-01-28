import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import type { GameSessionRoutingGateway } from '../../../../application/game-session/live/shared/gateways/game-session-routing.gateway';
import { DashboardReadGatewayMockFactory } from '../../../../test-utils/factories/dashboard-read-gateway-mock-factory';
import { GameTypeCatalogGatewayMockFactory } from '../../../../test-utils/factories/game-type-catalog-gateway-mock-factory';
import { resetGameTypeSequence } from '../../../../test-utils/factories/game-type-descriptor-fixture-factory';
import { DashboardRoutesFactory } from './dashboard-routes-factory';

describe('DashboardRoutesFactory', () => {
  const gameTypeCatalogGatewayMockFactory = new GameTypeCatalogGatewayMockFactory();
  const dashboardReadGatewayMockFactory = new DashboardReadGatewayMockFactory();
  const gameSessionRoutingGateway: GameSessionRoutingGateway = {
    resolveJoinRoute: () => '/game/join',
    resolveLobbyRoute: (pin) => `/game/${pin}/lobby`,
    resolveStageRoute: (pin, stageId) => `/game/${pin}/stage/${stageId}`,
    resolveStageResultRoute: (pin, stageId) => `/game/${pin}/stage/${stageId}/result`,
    resolveLeaderboardRoute: (pin) => `/game/${pin}/leaderboard`,
    resolveEntryRoute: (session) => `/game/${session.pin}/lobby`,
  };

  beforeEach(() => {
    resetGameTypeSequence();
  });

  describe('create()', () => {
    it('includes the dashboard index route', () => {
      // Arrange
      const gateway = gameTypeCatalogGatewayMockFactory.create({ descriptors: [] });

      // Act
      const routes = new DashboardRoutesFactory(
        gateway,
        dashboardReadGatewayMockFactory.create(),
        {
          resolveManageGameRoute: () => null,
          resolveOpenSessionRoute: (session: { pin: string }) =>
            gameSessionRoutingGateway.resolveEntryRoute(session as never),
        } as never,
        {
          loadOrganizationSelection: async () => ({ organizations: [], organizationId: null }),
        } as never,
      ).create();

      // Assert
      expect(routes.some((r) => r.path === 'workspace/dashboard')).toBe(true);
    });

    it('returns only the dashboard route regardless of game types', () => {
      // Arrange
      const gateway = gameTypeCatalogGatewayMockFactory.create();

      // Act
      const routes = new DashboardRoutesFactory(
        gateway,
        dashboardReadGatewayMockFactory.create(),
        {
          resolveManageGameRoute: () => null,
          resolveOpenSessionRoute: (session: { pin: string }) =>
            gameSessionRoutingGateway.resolveEntryRoute(session as never),
        } as never,
        {
          loadOrganizationSelection: async () => ({ organizations: [], organizationId: null }),
        } as never,
      ).create();

      // Assert
      expect(routes).toHaveLength(1);
    });
  });
});
