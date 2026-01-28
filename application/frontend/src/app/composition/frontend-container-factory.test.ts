import 'reflect-metadata';
import { Container } from 'inversify';
import { describe, expect, it } from 'vitest';
import { FrontendContainerFactory } from './frontend-container-factory';

describe('FrontendContainerFactory', () => {
  describe('create()', () => {
    it('returns an Inversify Container', () => {
      // Arrange
      const factory = new FrontendContainerFactory();

      // Act
      const container = factory.create();

      // Assert
      expect(container).toBeInstanceOf(Container);
    });

    it('returns a fresh Container on every call', () => {
      // Arrange
      const factory = new FrontendContainerFactory();

      // Act
      const first = factory.create();
      const second = factory.create();

      // Assert
      expect(first).not.toBe(second);
    });
  });
});
