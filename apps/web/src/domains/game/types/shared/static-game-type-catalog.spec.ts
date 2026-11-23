import { describe, expect, it } from 'vitest';
import { StaticGameTypeCatalog } from './static-game-type-catalog';

describe('StaticGameTypeCatalog', () => {
  it('returns descriptors in registration order', () => {
    // Arrange + Act
    const catalog = new StaticGameTypeCatalog([
      {
        key: 'quiz',
        badge: 'QZ',
        iconKey: 'quiz',
        titleKey: 'game.types.quiz.title',
        descriptionKey: 'game.types.quiz.description',
        managementRoutePath: '/quizzes',
      },
      {
        key: 'prediction',
        badge: 'PR',
        iconKey: 'prediction',
        titleKey: 'game.types.prediction.title',
        descriptionKey: 'game.types.prediction.description',
        managementRoutePath: '/predictions',
      },
    ]);

    // Assert
    expect(catalog.list()).toEqual([
      {
        key: 'quiz',
        badge: 'QZ',
        iconKey: 'quiz',
        titleKey: 'game.types.quiz.title',
        descriptionKey: 'game.types.quiz.description',
        managementRoutePath: '/quizzes',
      },
      {
        key: 'prediction',
        badge: 'PR',
        iconKey: 'prediction',
        titleKey: 'game.types.prediction.title',
        descriptionKey: 'game.types.prediction.description',
        managementRoutePath: '/predictions',
      },
    ]);
  });

  it('returns a defensive copy of the descriptors', () => {
    // Arrange
    const catalog = new StaticGameTypeCatalog([
      {
        key: 'quiz',
        badge: 'QZ',
        iconKey: 'quiz',
        titleKey: 'game.types.quiz.title',
        descriptionKey: 'game.types.quiz.description',
      },
    ]);
    const descriptors = [...catalog.list()];

    // Act
    descriptors.push({
      key: 'prediction',
      badge: 'PR',
      iconKey: 'prediction',
      titleKey: 'game.types.prediction.title',
      descriptionKey: 'game.types.prediction.description',
    });

    // Assert
    expect(catalog.list()).toEqual([
      {
        key: 'quiz',
        badge: 'QZ',
        iconKey: 'quiz',
        titleKey: 'game.types.quiz.title',
        descriptionKey: 'game.types.quiz.description',
      },
    ]);
  });
});
