import { useState } from 'react';
import type { PlayableContentImportExampleProvider } from '../../../../../../application/game/types/shared/contracts/playable-content-import.gateway';
import type { GameId } from '../../../../../../domains/game/entities/game';
import type { DashboardGameListItem } from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { DashboardGameSortField } from '../../../../../../domains/game/management/entities/dashboard-game-list-query';
import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePartyDependencies } from '../../../../../../presentation/game/party/shared/contexts/party-dependencies-context';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { CopyButton } from '../../../../../shared/ui/actions/copy-button';
import {
  FeedbackState,
  FeedbackStateGate,
} from '../../../../../shared/ui/feedback/feedback-state-gate';
import { EmptyState } from '../../../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { Checkbox } from '../../../../../shared/ui/forms/checkbox';
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

interface DashboardCreatePartyForm {
  readonly isPrivateParty: boolean;
  readonly privatePartyPassword: string;
}

const DEFAULT_CREATE_PARTY_FORM: DashboardCreatePartyForm = {
  isPrivateParty: false,
  privatePartyPassword: '',
};

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
  readonly onCreateParty: (
    game: DashboardGameListItem,
    options?: { privatePartyPassword?: string },
  ) => void;
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
  const { privatePartyPasswordGeneratorPort } = usePartyDependencies();
  const gateState = !hasSelectedProject
    ? FeedbackState.PENDING
    : isGamesLoading && totalGames === 0 && games.length === 0
      ? FeedbackState.LOADING
      : totalGames === 0
        ? FeedbackState.EMPTY
        : FeedbackState.READY;
  const selectedGameType = gameTypes.find((gameType) => gameType.key === createGameForm.type);
  const createGameTypeValue = createGameForm.type ?? '';
  const [createPartyGame, setCreatePartyGame] = useState<DashboardGameListItem | null>(null);
  const [createPartyForm, setCreatePartyForm] =
    useState<DashboardCreatePartyForm>(DEFAULT_CREATE_PARTY_FORM);
  const [showPrivatePartyPassword, setShowPrivatePartyPassword] = useState(false);

  const openCreatePartyDialog = (game: DashboardGameListItem) => {
    setCreatePartyGame(game);
    setCreatePartyForm(DEFAULT_CREATE_PARTY_FORM);
    setShowPrivatePartyPassword(false);
  };

  const closeCreatePartyDialog = () => {
    setCreatePartyGame(null);
    setCreatePartyForm(DEFAULT_CREATE_PARTY_FORM);
    setShowPrivatePartyPassword(false);
  };

  const generatePrivatePartyPassword = () => {
    const generatedPassword = privatePartyPasswordGeneratorPort.generatePrivatePartyPassword();

    setCreatePartyForm((current) => ({
      ...current,
      isPrivateParty: true,
      privatePartyPassword: generatedPassword,
    }));
    setShowPrivatePartyPassword(true);
  };

  const submitCreateParty = () => {
    if (!createPartyGame) {
      return;
    }

    const normalizedPassword = createPartyForm.privatePartyPassword.trim();
    const privatePartyPassword = createPartyForm.isPrivateParty
      ? normalizedPassword.length > 0
        ? normalizedPassword
        : undefined
      : undefined;

    onCreateParty(createPartyGame, {
      privatePartyPassword,
    });
    closeCreatePartyDialog();
  };

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
      <StatusBanner tone="error">
        {partyActionErrorMessage ? t(partyActionErrorMessage) : null}
      </StatusBanner>

      <FeedbackStateGate
        emptyLabel={t('dashboard.games.empty')}
        errorMessage={gamesErrorMessage ? t(gamesErrorMessage) : null}
        loadingLabel={t('common.loading')}
        loadingVariant="cards"
        pendingLabel={t('dashboard.games.pending')}
        state={gateState}
      >
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
                  onCreateParty={openCreatePartyDialog}
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
      </FeedbackStateGate>

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

      <FormDialog
        isOpen={createPartyGame !== null}
        onClose={closeCreatePartyDialog}
        onSubmit={(event) => {
          event.preventDefault();
          submitCreateParty();
        }}
        title={t('dashboard.games.createParty.title')}
        footer={
          <>
            <Button
              disabled={createPartyGame === null || creatingPartyGameId !== null}
              intent="primary"
              type="submit"
            >
              {t('dashboard.games.actions.createParty')}
            </Button>
            <Button intent="ghost" onClick={closeCreatePartyDialog} type="button">
              {t('common.cancel')}
            </Button>
          </>
        }
      >
        <SupportingText>
          {t('dashboard.games.createParty.subtitle', {
            game: createPartyGame?.title ?? '',
          })}
        </SupportingText>

        <Checkbox
          id="create-party-private"
          label={t('dashboard.games.createParty.privateToggleLabel')}
          description={t('dashboard.games.createParty.privateToggleDescription')}
          checked={createPartyForm.isPrivateParty}
          onChange={(event) => {
            const isPrivateParty = event.currentTarget.checked;

            setCreatePartyForm((current) => ({
              ...current,
              isPrivateParty,
              privatePartyPassword: isPrivateParty ? current.privatePartyPassword : '',
            }));
          }}
        />

        {createPartyForm.isPrivateParty ? (
          <ContentStack gap="xs">
            <FieldShell
              description={t('dashboard.games.createParty.privatePasswordHint')}
              id="create-party-password"
              label={t('dashboard.games.createParty.privatePasswordLabel')}
            >
              <Input
                id="create-party-password"
                onChange={(event) => {
                  setCreatePartyForm((current) => ({
                    ...current,
                    privatePartyPassword: event.target.value,
                  }));
                }}
                placeholder={t('dashboard.games.createParty.privatePasswordPlaceholder')}
                type={showPrivatePartyPassword ? 'text' : 'password'}
                value={createPartyForm.privatePartyPassword}
              />
            </FieldShell>

            <WrapRow gap="xs">
              <Button
                intent="secondary"
                leftSection={<AppIcon name="feature" size={14} />}
                onClick={generatePrivatePartyPassword}
                size="sm"
                type="button"
              >
                {t('dashboard.games.createParty.generatePasswordCta')}
              </Button>
              <CopyButton
                disabled={createPartyForm.privatePartyPassword.trim().length === 0}
                size="sm"
                textToCopy={createPartyForm.privatePartyPassword}
              >
                {t('dashboard.games.createParty.copyPasswordCta')}
              </CopyButton>
              <Button
                disabled={createPartyForm.privatePartyPassword.trim().length === 0}
                intent="ghost"
                leftSection={<AppIcon name="eye" size={14} />}
                onClick={() => setShowPrivatePartyPassword((current) => !current)}
                size="sm"
                type="button"
              >
                {showPrivatePartyPassword
                  ? t('dashboard.games.createParty.hidePasswordCta')
                  : t('dashboard.games.createParty.showPasswordCta')}
              </Button>
            </WrapRow>
          </ContentStack>
        ) : null}
      </FormDialog>
    </SectionCard>
  );
}
