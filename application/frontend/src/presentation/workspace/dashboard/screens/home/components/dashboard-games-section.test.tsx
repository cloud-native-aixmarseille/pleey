import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DashboardGameListItem } from '../../../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { GameTypeDescriptor } from '../../../../../../domains/game-catalog/entities/game-type-catalog';
import { createGameTypeDescriptorFixture } from '../../../../../../test-utils/factories/game-type-descriptor-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { DashboardGamesSection } from './dashboard-games-section';

type MockGameItemCardProps = {
  readonly descriptor?: Pick<GameTypeDescriptor, 'titleKey'>;
  readonly game: Pick<DashboardGameListItem, 'title'>;
  readonly onManage?: (game: Pick<DashboardGameListItem, 'title'>) => void;
};

type MockGameListFilterBarProps = {
  readonly totalFiltered: number;
  readonly totalGames: number;
};

type MockPaginationBarProps = {
  readonly currentPage: number;
  readonly totalPages: number;
};

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

vi.mock('./game-item-card', () => ({
  GameItemCard: ({ descriptor, game, onManage }: MockGameItemCardProps) => (
    <button onClick={() => onManage?.(game)} type="button">
      {game.title}:{descriptor?.titleKey ?? 'none'}
    </button>
  ),
}));

vi.mock('./game-list-filter-bar', () => ({
  GameListFilterBar: ({ totalFiltered, totalGames }: MockGameListFilterBarProps) => (
    <div data-testid="game-list-filter-bar">{`${String(totalFiltered)}/${String(totalGames)}`}</div>
  ),
}));

vi.mock('./pagination-bar', () => ({
  PaginationBar: ({ currentPage, totalPages }: MockPaginationBarProps) => (
    <div data-testid="pagination-bar">{`${String(currentPage)}/${String(totalPages)}`}</div>
  ),
}));

describe('DashboardGamesSection', () => {
  const quizDescriptor = createGameTypeDescriptorFixture({
    key: 'quiz',
    titleKey: 'gameType.quiz.title',
    iconKey: 'quiz',
  });

  function renderDashboardGamesSection(
    overrides: Partial<React.ComponentProps<typeof DashboardGamesSection>> = {},
  ) {
    const onManageGame = vi.fn();

    renderWithUiProvider(
      <DashboardGamesSection
        filters={{
          search: '',
          typeFilter: [],
          sortField: 'createdAt',
          sortDirection: 'desc',
          page: 1,
          pageSize: 9,
        }}
        gameTypes={[quizDescriptor]}
        gameTypesByKey={new Map([['quiz', quizDescriptor]])}
        games={[
          {
            gameId: 1,
            type: 'quiz',
            title: 'Arcade Quiz',
            description: null,
            createdAt: '2026-03-20T00:00:00.000Z',
            relatedGameId: 1,
            stageCount: 0,
          },
        ]}
        gamesErrorMessage={null}
        hasSelectedProject
        isGamesLoading={false}
        isLaunchDisabled={false}
        launchDisabledReason={null}
        onLaunchSession={vi.fn()}
        onManageGame={onManageGame}
        onPageChange={vi.fn()}
        onSearchChange={vi.fn()}
        onSortDirectionChange={vi.fn()}
        onSortFieldChange={vi.fn()}
        onTypeFilterChange={vi.fn()}
        totalFiltered={1}
        totalGames={1}
        totalPages={2}
        {...overrides}
      />,
    );

    return { onManageGame };
  }

  it('renders the pending state until a project is selected', () => {
    renderDashboardGamesSection({ hasSelectedProject: false });

    expect(screen.getByText('dashboard.games.pending')).toBeInTheDocument();
  });

  it('renders the empty state when the selected project has no games', () => {
    renderDashboardGamesSection({ games: [], totalFiltered: 0, totalGames: 0 });

    expect(screen.getByText('dashboard.games.empty')).toBeInTheDocument();
  });

  it('renders game cards and forwards manage actions for visible games', async () => {
    const user = userEvent.setup();
    const { onManageGame } = renderDashboardGamesSection();

    expect(screen.getByTestId('game-list-filter-bar')).toHaveTextContent('1/1');
    expect(screen.getByTestId('pagination-bar')).toHaveTextContent('1/2');

    await user.click(screen.getByRole('button', { name: 'Arcade Quiz:gameType.quiz.title' }));

    expect(onManageGame).toHaveBeenCalledWith({
      gameId: 1,
      type: 'quiz',
      title: 'Arcade Quiz',
      description: null,
      createdAt: '2026-03-20T00:00:00.000Z',
      relatedGameId: 1,
      stageCount: 0,
    });
  });
});
