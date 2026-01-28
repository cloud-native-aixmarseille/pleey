import { beforeEach, describe, expect, it } from 'vitest';
import {
  createGameTypeDescriptorFixture,
  resetGameTypeSequence,
} from '../../../test-utils/factories/game-type-descriptor-fixture-factory';
import { GameTypeCatalog, type GameTypeDescriptor } from './game-type-catalog';

describe('GameTypeCatalog', () => {
  beforeEach(() => {
    resetGameTypeSequence();
  });

  describe('list()', () => {
    it('returns all descriptors passed at construction', () => {
      // Arrange
      const descriptors = [createGameTypeDescriptorFixture(), createGameTypeDescriptorFixture()];
      const catalog = new GameTypeCatalog(descriptors);

      // Act
      const result = catalog.list();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('game-type-1');
      expect(result[1].key).toBe('game-type-2');
    });

    it('returns an empty array when no descriptors are provided', () => {
      // Arrange
      const catalog = new GameTypeCatalog([]);

      // Act
      const result = catalog.list();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('returns a defensive copy detached from the original array', () => {
      // Arrange
      const original = [createGameTypeDescriptorFixture()];
      const catalog = new GameTypeCatalog(original);

      // Act — mutate the returned array
      const first = catalog.list() as GameTypeDescriptor[];
      first.push(createGameTypeDescriptorFixture());
      const second = catalog.list();

      // Assert — the catalog should still hold one item
      expect(second).toHaveLength(1);
    });
  });
});
