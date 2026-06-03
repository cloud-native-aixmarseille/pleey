import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  CreatePartyDisabledReason,
  type DashboardGameListItem,
} from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { GameFixtureFactory } from '../../../../../../test-utils/fixtures/game-fixture-factory';
import { createGameTypeDescriptorFixture } from '../../../../../../test-utils/fixtures/game-type-descriptor-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { DashboardGamesSection } from './dashboard-games-section';

const gameFixtureFactory = new GameFixtureFactory();

type MockGameItemCardProps = {
  readonly descriptor?: Pick<GameTypeDescriptor, 'titleKey'>;
  readonly game: Pick<DashboardGameListItem, 'title' | 'permissions'>;
  readonly isCreatingParty?: boolean;
  readonly onCreateParty?: (game: Pick<DashboardGameListItem, 'title' | 'permissions'>) => void;
  readonly onManage?: (game: Pick<DashboardGameListItem, 'title' | 'permissions'>) => void;
};

type MockGameListFilterBarProps = {
  readonly totalFiltered: number;
  readonly totalGames: number;
};

type MockPaginationBarProps = {
  readonly currentPage: number;
  readonly pageOfLabel: string;
  readonly totalPages: number;
};

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

vi.mock('./game-item-card', () => ({
  GameItemCard: ({
    descriptor,
    game,
    isCreatingParty,
    onCreateParty,
    onManage,
  }: MockGameItemCardProps) => (
    <div>
      <button
        disabled={!game.permissions.createParty.allowed}
        onClick={() => onCreateParty?.(game)}
        type="button"
      >
        {`create:${game.title}:${String(isCreatingParty ?? false)}`}
      </button>
      <button onClick={() => onManage?.(game)} type="button">
        {game.title}:{descriptor?.titleKey ?? 'none'}
      </button>
    </div>
  ),
}));

vi.mock('./game-list-filter-bar', () => ({
  GameListFilterBar: ({ totalFiltered, totalGames }: MockGameListFilterBarProps) => (
    <div data-testid="game-list-filter-bar">{`${String(totalFiltered)}/${String(totalGames)}`}</div>
  ),
}));

vi.mock('../../../../shared/components/pagination-bar', () => ({
  PaginationBar: ({ currentPage, pageOfLabel, totalPages }: MockPaginationBarProps) => (
    <div data-testid="pagination-bar">{`${String(currentPage)}/${String(totalPages)}:${pageOfLabel}`}</div>
  ),
}));

describe('DashboardGamesSection', () => {
  const quizDescriptor = createGameTypeDescriptorFixture({
    key: 'quiz',
    titleKey: 'game.types.quiz.title',
    iconKey: 'quiz',
  });

  function renderDashboardGamesSection(
    overrides: Partial<React.ComponentProps<typeof DashboardGamesSection>> = {},
  ) {
    const onCloseCreateGameDialog = vi.fn();
    const onCreateGame = vi.fn();
    const onCreateGameFormChange = vi.fn();
    const onManageGame = vi.fn();
    const onOpenCreateGameDialog = vi.fn();
    const onCreateParty = vi.fn();
    const onCloseImportGameDialog = vi.fn();
    const onImportGame = vi.fn();
    const onImportGameFormChange = vi.fn();
    const onImportGameFileChange = vi.fn();
    const onOpenImportGameDialog = vi.fn();
    const game = gameFixtureFactory.createDashboardGame({
      gameId: 1,
      title: 'Arcade Quiz',
      description: null,
      createdAt: '2026-03-20T00:00:00.000Z',
      gameTypeId: 1,
      stageCount: 0,
    });

    renderWithUiProvider(
      <DashboardGamesSection
        creatingPartyGameId={null}
        createGameForm={{
          description: '',
          title: '',
          type: 'quiz',
        }}
        createGameErrorMessage={null}
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
        games={[game]}
        gamesErrorMessage={null}
        hasSelectedProject
        isCreateGameDialogOpen={false}
        isCreatingGame={false}
        isGamesLoading={false}
        importGameForm={{
          description: '',
          title: '',
          type: 'quiz',
        }}
        importGameFile={null}
        importGameErrorMessage={null}
        importExampleProvider={null}
        importAcceptedFileTypes=".json,application/json,.csv,text/csv"
        isImportGameDialogOpen={false}
        isImportingGame={false}
        onCloseCreateGameDialog={onCloseCreateGameDialog}
        onCreateGame={onCreateGame}
        onCreateGameFormChange={onCreateGameFormChange}
        onCreateParty={onCreateParty}
        onManageGame={onManageGame}
        onOpenCreateGameDialog={onOpenCreateGameDialog}
        onCloseImportGameDialog={onCloseImportGameDialog}
        onImportGame={onImportGame}
        onImportGameFormChange={onImportGameFormChange}
        onImportGameFileChange={onImportGameFileChange}
        onOpenImportGameDialog={onOpenImportGameDialog}
        onPageChange={vi.fn()}
        onSearchChange={vi.fn()}
        onSortDirectionChange={vi.fn()}
        onSortFieldChange={vi.fn()}
        onTypeFilterChange={vi.fn()}
        partyActionErrorMessage={null}
        totalFiltered={1}
        totalGames={1}
        totalPages={2}
        {...overrides}
      />,
    );

    return {
      onCloseCreateGameDialog,
      onCreateGame,
      onCreateGameFormChange,
      onCreateParty,
      onManageGame,
      onOpenCreateGameDialog,
      onCloseImportGameDialog,
      onImportGame,
      onImportGameFormChange,
      onImportGameFileChange,
      onOpenImportGameDialog,
    };
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
    expect(screen.getByTestId('pagination-bar')).toHaveTextContent(
      '1/2:dashboard.games.pagination.pageOf',
    );

    await user.click(screen.getByRole('button', { name: 'Arcade Quiz:game.types.quiz.title' }));

    expect(onManageGame).toHaveBeenCalledWith(
      gameFixtureFactory.createDashboardGame({
        gameId: 1,
        title: 'Arcade Quiz',
        description: null,
        createdAt: '2026-03-20T00:00:00.000Z',
        gameTypeId: 1,
        stageCount: 0,
      }),
    );
  });

  it('forwards create-party actions for visible games', async () => {
    const user = userEvent.setup();
    const { onCreateParty } = renderDashboardGamesSection();

    await user.click(screen.getByRole('button', { name: 'create:Arcade Quiz:false' }));

    expect(onCreateParty).toHaveBeenCalledWith(
      gameFixtureFactory.createDashboardGame({
        gameId: 1,
        title: 'Arcade Quiz',
        description: null,
        createdAt: '2026-03-20T00:00:00.000Z',
        gameTypeId: 1,
        stageCount: 0,
      }),
    );
  });

  it('disables create-party actions when the game is not eligible', () => {
    renderDashboardGamesSection({
      games: [
        gameFixtureFactory.createBlockedDashboardGame({
          gameId: 1,
          title: 'Arcade Quiz',
          description: null,
          createdAt: '2026-03-20T00:00:00.000Z',
          gameTypeId: 1,
          stageCount: 0,
          permissions: {
            createParty: {
              allowed: false,
              reason: CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY,
            },
          },
        }),
      ],
    });

    expect(screen.getByRole('button', { name: 'create:Arcade Quiz:false' })).toBeDisabled();
  });

  it('opens the create-game dialog and forwards form changes', async () => {
    const user = userEvent.setup();
    const { onCreateGameFormChange, onOpenCreateGameDialog } = renderDashboardGamesSection({
      isCreateGameDialogOpen: true,
    });

    await user.click(screen.getByRole('button', { name: 'dashboard.games.actions.createGame' }));

    expect(onOpenCreateGameDialog).toHaveBeenCalledTimes(1);
    const dialog = await screen.findByRole('dialog');
    const textboxes = within(dialog).getAllByRole('textbox');

    await user.type(textboxes[0], 'Speed Quiz');
    await user.type(textboxes[1], 'Short live rounds');

    expect(onCreateGameFormChange).toHaveBeenCalledWith({ title: 'S' });
    expect(onCreateGameFormChange).toHaveBeenCalledWith({ description: 'S' });
  });

  it('submits the create-game dialog', async () => {
    const user = userEvent.setup();
    const { onCreateGame } = renderDashboardGamesSection({
      isCreateGameDialogOpen: true,
    });

    await user.click(screen.getByRole('button', { name: 'dashboard.games.create.submit' }));

    expect(onCreateGame).toHaveBeenCalledTimes(1);
  });

  it('opens the import-game dialog from the import action', async () => {
    const user = userEvent.setup();
    const { onOpenImportGameDialog } = renderDashboardGamesSection();

    await user.click(screen.getByRole('button', { name: 'dashboard.games.actions.importGame' }));

    expect(onOpenImportGameDialog).toHaveBeenCalledTimes(1);
  });

  it('submits the import-game dialog once a file is selected', async () => {
    const user = userEvent.setup();
    const { onImportGame } = renderDashboardGamesSection({
      isImportGameDialogOpen: true,
      importGameForm: { description: '', title: 'Imported Quiz', type: 'quiz' },
      importGameFile: new File(['content'], 'questions.csv', { type: 'text/csv' }),
    });

    await user.click(screen.getByRole('button', { name: 'dashboard.games.import.submit' }));

    expect(onImportGame).toHaveBeenCalledTimes(1);
  });
});
