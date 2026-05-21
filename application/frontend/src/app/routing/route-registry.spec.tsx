import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PartyIdentifier } from '../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { StageIdentifier } from '../../application/game/party/shared/services/identifiers/stage-identifier';
import { PartyRouteService } from '../../application/game/party/shared/services/party-route.service';
import { DashboardWorkspaceFacade } from '../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import { OrganizationManagementFacade } from '../../application/workspace/organizations/facades/organization-management.facade';
import { PartyRoutesFactory } from '../../presentation/game/party/shared/routes/party-routes-factory';
import { AuthRoutesFactory } from '../../presentation/identity/routes/auth-routes-factory';
import { DashboardRoutesFactory } from '../../presentation/workspace/dashboard/routes/dashboard-routes-factory';
import { OrganizationRoutesFactory } from '../../presentation/workspace/organizations/routes/organization-routes-factory';
import { resetGameTypeSequence } from '../../test-utils/fixtures/game-type-descriptor-fixture-factory';
import { GameTypeCatalogGatewayMockFactory } from '../../test-utils/mocks/game-type-catalog-gateway-mock-factory';
import { RouteRegistry } from './route-registry';

const partyIdentifier = new PartyIdentifier();
const partyPinIdentifier = new PartyPinIdentifier();
const stageIdentifier = new StageIdentifier();

function createPartyRouteService(): PartyRouteService {
  return new PartyRouteService(partyIdentifier, partyPinIdentifier, stageIdentifier);
}

vi.mock('react-i18next', async () => {
  const { ReactI18nextMockFactory } = await import(
    'src/test-utils/mocks/react-i18next-mock-factory'
  );

  return new ReactI18nextMockFactory().createModule();
});

describe('RouteRegistry', () => {
  const gameTypeCatalogGatewayMockFactory = new GameTypeCatalogGatewayMockFactory();

  function createRegistry(): RouteRegistry {
    return new RouteRegistry([
      new AuthRoutesFactory(),
      new PartyRoutesFactory(createPartyRouteService()),
      new DashboardRoutesFactory(
        gameTypeCatalogGatewayMockFactory.create(),
        { resolveManageGameRoute: vi.fn() } as never,
        {
          loadProjectGameCatalog: vi.fn(),
          restoreOrganizationSelection: vi.fn(),
          loadOrganizationWorkspaceState: vi.fn(),
        } as never,
        createPartyRouteService(),
      ),
      new OrganizationRoutesFactory(
        {
          restoreOrganizationSelection: vi.fn(),
          loadOrganizationWorkspaceState: vi.fn(),
        } as unknown as DashboardWorkspaceFacade,
        {
          createOrganization: vi.fn(),
          createProject: vi.fn(),
          updateProject: vi.fn(),
          deleteProject: vi.fn(),
        } as unknown as OrganizationManagementFacade,
      ),
    ]);
  }

  beforeEach(() => {
    resetGameTypeSequence();
  });

  describe('getRoutes()', () => {
    it('returns a single root route at path "/"', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const routes = registry.getRoutes();

      // Assert
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/');
    });

    it('includes an identity/sign-in child route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'identity/sign-in')).toBe(true);
    });

    it('includes an identity/register child route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'identity/register')).toBe(true);
    });

    it('includes a dashboard index route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'workspace/dashboard')).toBe(true);
    });

    it('includes the host party journey route and join route', () => {
      const registry = createRegistry();

      const children = registry.getRoutes()[0].children ?? [];

      expect(children.some((r) => r.path === 'party/:partyId/*')).toBe(true);
      expect(children.some((r) => r.path === 'join/:pin')).toBe(true);
    });

    it('includes the organization management route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'workspace/organizations')).toBe(true);
    });

    it('includes an identity/forgot-password child route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'identity/forgot-password')).toBe(true);
    });

    it('includes a wildcard catch-all route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === '*')).toBe(true);
    });
  });
});
