import 'reflect-metadata';
import { Container } from 'inversify';
import { describe, expect, it } from 'vitest';
import {
  GAME_TYPE_CATALOG_GATEWAY,
  type GameTypeCatalogGateway,
} from '../../application/game/types/shared/gateways/game-type-catalog.gateway';
import { GameType } from '../../domains/game/types/shared/game-type';
import { ROUTE_REGISTRY, RouteRegistry } from '../routing/route-registry';
import { AppProviderFactoryToken, createAppProviderFactories } from './app-provider-factory';
import { createAppContainer } from './create-app-container';
import { AppPartyGameTypeRuntimeRegistry } from './modules/party/services/app-party-game-type-runtime-registry';

describe('createAppContainer', () => {
  describe('create()', () => {
    it('returns an Inversify Container', () => {
      // Arrange + Act
      const container = createAppContainer();

      // Assert
      expect(container).toBeInstanceOf(Container);
    });

    it('resolves the routeRegistry token to a RouteRegistry instance', () => {
      // Arrange + Act
      const container = createAppContainer();

      // Assert
      expect(container.get<RouteRegistry>(ROUTE_REGISTRY)).toBeInstanceOf(RouteRegistry);
    });

    it('resolves the gameTypeCatalogGateway token to a gateway with listCatalog', () => {
      // Arrange
      const container = createAppContainer();

      // Act
      const gateway = container.get<GameTypeCatalogGateway>(GAME_TYPE_CATALOG_GATEWAY);
      // Assert
      expect(typeof gateway.listCatalog).toBe('function');
    });

    it.each(Object.values(GameType))('registers a party runtime view for %s', (gameType) => {
      // Arrange
      const container = createAppContainer();
      const registry = container.get(AppPartyGameTypeRuntimeRegistry);

      // Act
      const runtimeView = registry.resolve(gameType);

      // Assert
      expect(runtimeView).toBeDefined();
    });

    it('returns the same RouteRegistry singleton on repeated resolution', () => {
      // Arrange
      const container = createAppContainer();

      const first = container.get<RouteRegistry>(ROUTE_REGISTRY);
      // Act
      const second = container.get<RouteRegistry>(ROUTE_REGISTRY);

      // Assert
      expect(first).toBe(second);
    });

    it('resolves the normalized app provider factories from bootstrap modules', () => {
      // Arrange
      const container = createAppContainer();

      // Act
      const providerFactories = createAppProviderFactories(container);

      // Assert
      expect(container.isBound(AppProviderFactoryToken)).toBe(true);
      expect(providerFactories).toHaveLength(11);
    });
  });
});
