import 'reflect-metadata';
import { Container } from 'inversify';
import { describe, expect, it } from 'vitest';
import type { GameTypeCatalogGateway } from '../../application/game-catalog/gateways/game-type-module.gateway';
import { AppGuestPlayerRuntime } from '../game-session/live/player/runtimes/app-guest-player-runtime';
import { RouteRegistry } from '../routing/route-registry';
import { RuntimeContainerBuilder } from './runtime-container-builder';
import { TOKENS } from './tokens';

describe('RuntimeContainerBuilder', () => {
  describe('build()', () => {
    it('returns an Inversify Container', () => {
      // Arrange + Act
      const container = new RuntimeContainerBuilder().build();

      // Assert
      expect(container).toBeInstanceOf(Container);
    });

    it('resolves the routeRegistry token to a RouteRegistry instance', () => {
      // Arrange + Act
      const container = new RuntimeContainerBuilder().build();

      // Assert
      expect(container.get<RouteRegistry>(TOKENS.routeRegistry)).toBeInstanceOf(RouteRegistry);
    });

    it('resolves the gameTypeCatalogGateway token to a gateway with listCatalog', () => {
      // Arrange + Act
      const container = new RuntimeContainerBuilder().build();

      // Assert
      const gateway = container.get<GameTypeCatalogGateway>(TOKENS.gameTypeCatalogGateway);
      expect(typeof gateway.listCatalog).toBe('function');
    });

    it('returns the same RouteRegistry singleton on repeated resolution', () => {
      // Arrange
      const container = new RuntimeContainerBuilder().build();

      // Act
      const first = container.get<RouteRegistry>(TOKENS.routeRegistry);
      const second = container.get<RouteRegistry>(TOKENS.routeRegistry);

      // Assert
      expect(first).toBe(second);
    });

    it('resolves the player guest runtime after loading the player module', () => {
      const container = new RuntimeContainerBuilder().build();

      expect(container.get(AppGuestPlayerRuntime)).toBeInstanceOf(AppGuestPlayerRuntime);
    });
  });
});
