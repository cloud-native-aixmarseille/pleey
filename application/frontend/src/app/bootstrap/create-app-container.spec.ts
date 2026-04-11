import 'reflect-metadata';
import { Container } from 'inversify';
import { describe, expect, it } from 'vitest';
import {
  GAME_TYPE_CATALOG_GATEWAY,
  type GameTypeCatalogGateway,
} from '../../application/game/types/shared/gateways/game-type-catalog.gateway';
import { ROUTE_REGISTRY, RouteRegistry } from '../routing/route-registry';
import { AppProviderFactoryToken, createAppProviderFactories } from './app-provider-factory';
import { createAppContainer } from './create-app-container';

describe('createAppContainer', () => {
  describe('create()', () => {
    it('returns an Inversify Container', () => {
      const container = createAppContainer();

      expect(container).toBeInstanceOf(Container);
    });

    it('resolves the routeRegistry token to a RouteRegistry instance', () => {
      const container = createAppContainer();

      expect(container.get<RouteRegistry>(ROUTE_REGISTRY)).toBeInstanceOf(RouteRegistry);
    });

    it('resolves the gameTypeCatalogGateway token to a gateway with listCatalog', () => {
      const container = createAppContainer();

      const gateway = container.get<GameTypeCatalogGateway>(GAME_TYPE_CATALOG_GATEWAY);
      expect(typeof gateway.listCatalog).toBe('function');
    });

    it('returns the same RouteRegistry singleton on repeated resolution', () => {
      const container = createAppContainer();

      const first = container.get<RouteRegistry>(ROUTE_REGISTRY);
      const second = container.get<RouteRegistry>(ROUTE_REGISTRY);

      expect(first).toBe(second);
    });

    it('resolves the normalized app provider factories from bootstrap modules', () => {
      const container = createAppContainer();

      const providerFactories = createAppProviderFactories(container);

      expect(container.isBound(AppProviderFactoryToken)).toBe(true);
      expect(providerFactories).toHaveLength(8);
    });
  });
});
