import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createGameTypeDescriptorFixture } from '../../../../../../test-utils/factories/game-type-descriptor-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { GameItemCard } from './game-item-card';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

vi.mock('../../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal);
});

describe('GameItemCard', () => {
  it('renders the summary text when a descriptor is available', () => {
    const descriptor = createGameTypeDescriptorFixture({
      key: 'quiz',
      badge: 'QUIZ',
      titleKey: 'games.quiz.title',
    });

    renderWithUiProvider(
      <GameItemCard
        descriptor={descriptor}
        game={{
          gameId: 18,
          type: 'quiz',
          title: 'Roadmap quiz',
          description: 'Planning workshop',
          createdAt: '2026-03-19T08:30:00.000Z',
          relatedGameId: 1,
          stageCount: 14,
          summary: {
            translationKey: 'quiz.management.questionSummary',
            values: {
              count: '14',
            },
          },
        }}
        showTypeBadge
      />,
    );

    expect(screen.getByText('Roadmap quiz')).toBeInTheDocument();
    expect(screen.getByText('quiz.management.questionSummary (count=14)')).toBeInTheDocument();
  });
});
