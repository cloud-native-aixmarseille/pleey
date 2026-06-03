import type { PlayableContentImportExampleProvider } from '../../../../../../application/game/types/shared/contracts/playable-content-import.gateway';
import type { GameId } from '../../../../../../domains/game/entities/game';
import type { DashboardGameListItem } from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { DashboardGameSortField } from '../../../../../../domains/game/management/entities/dashboard-game-list-query';
import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import {
  EmptyState,
  LoadingState,
  PendingState,
} from '../../../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { Select } from '../../../../../shared/ui/forms/select';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, ResponsiveGrid, WrapRow } from '../../../../../shared/ui/layout/containers';
import { SectionCard } from '../../../../../shared/ui/layout/section-card';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';
import { PaginationBar } from '../../../../shared/components/pagination-bar';
import type { GameListFiltersState } from '../../../hooks/use-game-list-filters';
import { DashboardImportGameDialog } from './dashboard-import-game-dialog';
import { GameItemCard } from './game-item-card';
import { GameListFilterBar } from './game-list-filter-bar';

interface DashboardCreateGameForm {
  readonly description: string;
  readonly title: string;
  readonly type: GameType | null;
}

interface DashboardGamesSectionProps {
  readonly hasSelectedProject: boolean;
  readonly creatingPartyGameId: GameId | null;
  readonly createGameForm: DashboardCreateGameForm;
  readonly createGameErrorMessage: string | null;
  readonly games: readonly DashboardGameListItem[];
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly gameTypesByKey: ReadonlyMap<GameType, GameTypeDescriptor>;
  readonly filters: GameListFiltersState;
  readonly importGameForm: DashboardCreateGameForm;
  readonly importGameFile: File | null;
  readonly importGameErrorMessage: string | null;
  readonly importExampleProvider: PlayableContentImportExampleProvider | null;
  readonly importAcceptedFileTypes: string;
  readonly isCreateGameDialogOpen: boolean;
  readonly isCreatingGame: boolean;
  readonly isImportGameDialogOpen: boolean;
  readonly isImportingGame: boolean;
  readonly partyActionErrorMessage: string | null;
  readonly isGamesLoading: boolean;
  readonly gamesErrorMessage: string | null;
  readonly totalFiltered: number;
  readonly totalGames: number;
  readonly totalPages: number;
  readonly onCloseCreateGameDialog: () => void;
  readonly onCreateGame: () => void;
  readonly onCreateGameFormChange: (value: Partial<DashboardCreateGameForm>) => void;
  readonly onOpenCreateGameDialog: () => void;
  readonly onCloseImportGameDialog: () => void;
  readonly onImportGame: () => void;
  readonly onImportGameFormChange: (value: Partial<DashboardCreateGameForm>) => void;
  readonly onImportGameFileChange: (file: File | null) => void;
  readonly onOpenImportGameDialog: () => void;
  readonly onSearchChange: (value: string) => void;
  readonly onTypeFilterChange: (value: GameType[]) => void;
  readonly onSortFieldChange: (value: DashboardGameSortField) => void;
  readonly onSortDirectionChange: (value: 'asc' | 'desc') => void;
  readonly onPageChange: (value: number) => void;
  readonly onCreateParty: (game: DashboardGameListItem) => void;
  readonly onManageGame: (game: DashboardGameListItem) => void;
}

export function DashboardGamesSection({
  hasSelectedProject,
  creatingPartyGameId,
  createGameForm,
  createGameErrorMessage,
  games,
  gameTypes,
  gameTypesByKey,
  filters,
  importGameForm,
  importGameFile,
  importGameErrorMessage,
  importExampleProvider,
  importAcceptedFileTypes,
  isCreateGameDialogOpen,
  isCreatingGame,
  isImportGameDialogOpen,
  isImportingGame,
  partyActionErrorMessage,
  isGamesLoading,
  gamesErrorMessage,
  totalFiltered,
  totalGames,
  totalPages,
  onCloseCreateGameDialog,
  onCreateGame,
  onCreateGameFormChange,
  onOpenCreateGameDialog,
  onCloseImportGameDialog,
  onImportGame,
  onImportGameFormChange,
  onImportGameFileChange,
  onOpenImportGameDialog,
  onSearchChange,
  onTypeFilterChange,
  onSortFieldChange,
  onSortDirectionChange,
  onPageChange,
  onCreateParty,
  onManageGame,
}: DashboardGamesSectionProps) {
  const { t } = usePresentationTranslation();
  const isInitialLoading = isGamesLoading && totalGames === 0 && games.length === 0;
  const selectedGameType = gameTypes.find((gameType) => gameType.key === createGameForm.type);
  const createGameTypeValue = createGameForm.type ?? '';

  return (
    <SectionCard
      actions={
        <WrapRow gap="sm">
          <Button
            disabled={!hasSelectedProject || isImportingGame}
            intent="ghost"
            leftSection={<AppIcon name="arrow-up" size={14} />}
            onClick={onOpenImportGameDialog}
            size="sm"
          >
            {t('dashboard.games.actions.importGame')}
          </Button>
          <Button
            disabled={!hasSelectedProject || isCreatingGame}
            intent="primary"
            leftSection={<AppIcon name="game" size={14} />}
            onClick={onOpenCreateGameDialog}
            size="sm"
          >
            {t('dashboard.games.actions.createGame')}
          </Button>
        </WrapRow>
      }
      title={t('dashboard.games.title')}
    >
      <StatusBanner tone="error">{gamesErrorMessage ? t(gamesErrorMessage) : null}</StatusBanner>
      <StatusBanner tone="error">
        {partyActionErrorMessage ? t(partyActionErrorMessage) : null}
      </StatusBanner>

      {!hasSelectedProject ? (
        <PendingState>{t('dashboard.games.pending')}</PendingState>
      ) : isInitialLoading ? (
        <LoadingState variant="cards">{t('common.loading')}</LoadingState>
      ) : totalGames === 0 ? (
        <EmptyState>{t('dashboard.games.empty')}</EmptyState>
      ) : (
        <ContentStack gap="md">
          <GameListFilterBar
            filters={filters}
            gameTypes={gameTypes}
            onSearchChange={onSearchChange}
            onSortDirectionChange={onSortDirectionChange}
            onSortFieldChange={onSortFieldChange}
            onTypeFilterChange={onTypeFilterChange}
            totalFiltered={totalFiltered}
            totalGames={totalGames}
          />

          {games.length === 0 ? (
            <EmptyState>{t('dashboard.games.filters.noResults')}</EmptyState>
          ) : (
            <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="md">
              {games.map((game) => (
                <GameItemCard
                  key={`${game.type}-${game.gameTypeId ?? game.gameId}`}
                  game={game}
                  descriptor={gameTypesByKey.get(game.type)}
                  isCreatingParty={creatingPartyGameId === game.gameId}
                  onCreateParty={onCreateParty}
                  onManage={onManageGame}
                  showTypeBadge
                />
              ))}
            </ResponsiveGrid>
          )}

          <PaginationBar
            currentPage={filters.page}
            label={t('dashboard.games.pagination.label')}
            nextLabel={t('dashboard.games.pagination.next')}
            onPageChange={onPageChange}
            pageOfLabel={t('dashboard.games.pagination.pageOf', {
              current: String(filters.page),
              total: String(totalPages),
            })}
            previousLabel={t('dashboard.games.pagination.previous')}
            totalPages={totalPages}
          />
        </ContentStack>
      )}

      <FormDialog
        banner={
          <StatusBanner tone="error">
            {createGameErrorMessage ? t(createGameErrorMessage) : null}
          </StatusBanner>
        }
        footer={
          <>
            <Button disabled={isCreatingGame} intent="primary" type="submit">
              {isCreatingGame ? t('common.loading') : t('dashboard.games.create.submit')}
            </Button>
            <Button intent="ghost" onClick={onCloseCreateGameDialog} type="button">
              {t('common.cancel')}
            </Button>
          </>
        }
        isOpen={isCreateGameDialogOpen}
        onClose={onCloseCreateGameDialog}
        onSubmit={(event) => {
          event.preventDefault();
          void onCreateGame();
        }}
        title={t('dashboard.games.create.title')}
      >
        <FieldShell id="create-game-type" label={t('dashboard.games.create.typeLabel')} required>
          <Select
            id="create-game-type"
            onChange={(event) =>
              onCreateGameFormChange({
                type:
                  event.target.value === GameType.Prediction
                    ? GameType.Prediction
                    : event.target.value === GameType.Quiz
                      ? GameType.Quiz
                      : null,
              })
            }
            value={createGameTypeValue}
          >
            {gameTypes.map((gameType) => (
              <option key={gameType.key} value={gameType.key}>
                {t(gameType.titleKey)}
              </option>
            ))}
          </Select>
        </FieldShell>
        {selectedGameType ? (
          <SupportingText>{t(selectedGameType.descriptionKey)}</SupportingText>
        ) : null}
        <FieldShell id="create-game-title" label={t('dashboard.games.create.titleLabel')} required>
          <Input
            id="create-game-title"
            onChange={(event) => onCreateGameFormChange({ title: event.target.value })}
            value={createGameForm.title}
          />
        </FieldShell>
        <FieldShell
          id="create-game-description"
          label={t('dashboard.games.create.descriptionLabel')}
        >
          <Textarea
            id="create-game-description"
            onChange={(event) => onCreateGameFormChange({ description: event.target.value })}
            rows={3}
            value={createGameForm.description}
          />
        </FieldShell>
      </FormDialog>

      <DashboardImportGameDialog
        errorMessage={importGameErrorMessage}
        exampleProvider={importExampleProvider}
        acceptedFileTypes={importAcceptedFileTypes}
        file={importGameFile}
        form={importGameForm}
        gameTypes={gameTypes}
        isImporting={isImportingGame}
        isOpen={isImportGameDialogOpen}
        onClose={onCloseImportGameDialog}
        onFileChange={onImportGameFileChange}
        onFormChange={onImportGameFormChange}
        onSubmit={onImportGame}
      />
    </SectionCard>
  );
}
