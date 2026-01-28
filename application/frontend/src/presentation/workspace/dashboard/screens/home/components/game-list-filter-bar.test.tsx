import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createGameTypeDescriptorFixture } from '../../../../../../test-utils/factories/game-type-descriptor-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { GameListFilterBar } from './game-list-filter-bar';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('GameListFilterBar', () => {
  const gameTypes = [
    createGameTypeDescriptorFixture({ key: 'quiz', titleKey: 'gameType.quiz.title' }),
    createGameTypeDescriptorFixture({
      key: 'prediction',
      titleKey: 'gameType.prediction.title',
      iconKey: 'prediction',
    }),
  ];

  function renderGameListFilterBar(
    overrides: Partial<React.ComponentProps<typeof GameListFilterBar>> = {},
  ) {
    const onSearchChange = vi.fn();
    const onSortDirectionChange = vi.fn();
    const onSortFieldChange = vi.fn();
    const onTypeFilterChange = vi.fn();

    renderWithUiProvider(
      <GameListFilterBar
        filters={{
          search: '',
          typeFilter: [],
          sortField: 'createdAt',
          sortDirection: 'desc',
          page: 1,
          pageSize: 9,
        }}
        gameTypes={gameTypes}
        onSearchChange={onSearchChange}
        onSortDirectionChange={onSortDirectionChange}
        onSortFieldChange={onSortFieldChange}
        onTypeFilterChange={onTypeFilterChange}
        totalFiltered={2}
        totalGames={5}
        {...overrides}
      />,
    );

    return { onSearchChange, onSortDirectionChange, onSortFieldChange, onTypeFilterChange };
  }

  it('forwards search input changes', () => {
    const { onSearchChange } = renderGameListFilterBar();

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'arcade' } });

    expect(onSearchChange).toHaveBeenCalledWith('arcade');
  });

  it('toggles sort direction when the active sort chip is clicked', () => {
    const { onSortDirectionChange, onSortFieldChange } = renderGameListFilterBar();

    fireEvent.click(screen.getByRole('button', { name: 'dashboard.games.filters.sortDate' }));

    expect(onSortDirectionChange).toHaveBeenCalledWith('asc');
    expect(onSortFieldChange).not.toHaveBeenCalled();
  });

  it('switches sort field and applies its default direction', () => {
    const { onSortDirectionChange, onSortFieldChange } = renderGameListFilterBar();

    fireEvent.click(screen.getByRole('button', { name: 'dashboard.games.filters.sortName' }));

    expect(onSortFieldChange).toHaveBeenCalledWith('title');
    expect(onSortDirectionChange).toHaveBeenCalledWith('asc');
    expect(
      screen.getByText('dashboard.games.filters.showing (count=2, total=5)'),
    ).toBeInTheDocument();
  });
});
