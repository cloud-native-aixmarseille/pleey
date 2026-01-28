import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { GameTypeCatalog } from '../../../domains/game-catalog/entities/game-type-catalog';
import { RegisteredGameTypeCatalogGateway } from './registered-game-type-module.gateway';

describe('RegisteredGameTypeCatalogGateway', () => {
  describe('listCatalog()', () => {
    it('returns a GameTypeCatalog instance', () => {
      // Arrange
      const gateway = new RegisteredGameTypeCatalogGateway([
        {
          descriptor: {
            key: 'quiz',
            badge: '01',
            iconKey: 'quiz',
            titleKey: 'quiz.gameType.title',
            descriptionKey: 'quiz.gameType.description',
            managementRoutePath: '/quizzes',
          },
        },
      ]);

      // Act
      const result = gateway.listCatalog();

      // Assert
      expect(result).toBeInstanceOf(GameTypeCatalog);
    });

    it('projects descriptors contributed by feature scopes', () => {
      // Arrange
      const gateway = new RegisteredGameTypeCatalogGateway([
        {
          descriptor: {
            key: 'prediction',
            badge: '02',
            iconKey: 'prediction',
            titleKey: 'prediction.gameType.title',
            descriptionKey: 'prediction.gameType.description',
            managementRoutePath: '/predictions',
          },
        },
        {
          descriptor: {
            key: 'quiz',
            badge: '01',
            iconKey: 'quiz',
            titleKey: 'quiz.gameType.title',
            descriptionKey: 'quiz.gameType.description',
            managementRoutePath: '/quizzes',
          },
        },
      ]);

      // Act
      const types = gateway.listCatalog().list();

      // Assert
      expect(types).toEqual([
        {
          key: 'quiz',
          badge: '01',
          iconKey: 'quiz',
          titleKey: 'quiz.gameType.title',
          descriptionKey: 'quiz.gameType.description',
          managementRoutePath: '/quizzes',
        },
        {
          key: 'prediction',
          badge: '02',
          iconKey: 'prediction',
          titleKey: 'prediction.gameType.title',
          descriptionKey: 'prediction.gameType.description',
          managementRoutePath: '/predictions',
        },
      ]);
    });

    it('returns a fresh catalog on each call', () => {
      // Arrange
      const gateway = new RegisteredGameTypeCatalogGateway([]);

      // Act
      const first = gateway.listCatalog();
      const second = gateway.listCatalog();

      // Assert
      expect(first).not.toBe(second);
    });
  });
});
