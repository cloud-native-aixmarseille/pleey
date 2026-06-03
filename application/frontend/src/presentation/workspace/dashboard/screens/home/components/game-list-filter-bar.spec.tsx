import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import { createGameTypeDescriptorFixture } from '../../../../../../test-utils/fixtures/game-type-descriptor-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { PlayableItemEditorValidator } from '../../../../../game/types/shared/management/playable-item-editor-validator';
import { provideWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';
import { GameListFilterBar } from './game-list-filter-bar';

const playableItemEditorValidator = new PlayableItemEditorValidator();

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

vi.mock('../../../../../shared/ui/forms/multi-select', () => ({
  MultiSelect: ({
    'aria-label': ariaLabel,
    onChange,
  }: {
    'aria-label'?: string;
    onChange: (value: string[]) => void;
  }) => (
    <button type="button" aria-label={ariaLabel} onClick={() => onChange([' QUIZ ', 'invalid'])}>
      Mock multi select
    </button>
  ),
}));

describe('GameListFilterBar', () => {
  const gameTypes = [
    createGameTypeDescriptorFixture({ key: 'quiz', titleKey: 'game.types.quiz.title' }),
    createGameTypeDescriptorFixture({
      key: 'prediction',
      titleKey: 'game.types.prediction.title',
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
      provideWorkspaceDependencies(
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
        {
          gameTypeParser: {
            parseOrNull: (value) => {
              if (typeof value !== 'string') {
                return null;
              }

              const normalizedValue = value.trim().toLowerCase();

              return normalizedValue === GameType.Quiz || normalizedValue === GameType.Prediction
                ? normalizedValue
                : null;
            },
          },
          organizationFormFacade: {} as never,
          organizationIdentifier: {
            parseOrNull: () => null,
          },
          playableItemEditorValidator,
          projectFormFacade: {} as never,
          projectIdentifier: {
            parseOrNull: () => null,
          },
        },
      ),
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

  it('parses selected game types before forwarding the filter change', () => {
    const { onTypeFilterChange } = renderGameListFilterBar();

    fireEvent.click(screen.getByRole('button', { name: 'dashboard.games.filters.typeLabel' }));

    expect(onTypeFilterChange).toHaveBeenCalledWith([GameType.Quiz]);
  });
});
