import { useState } from 'react';
import type { PlayableContentImportExampleProvider } from '../../../../../../application/game/types/shared/ports/playable-content-import-example-provider.port';
import type { GameId } from '../../../../../../domains/game/entities/game';
import type { DashboardGameListItem } from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { DashboardGameSortField } from '../../../../../../domains/game/management/entities/dashboard-game-list-query';
import {
  DEFAULT_PARTY_SETTINGS,
  type PartySettings,
} from '../../../../../../domains/game/party/shared/entities/party-settings';
import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { Project } from '../../../../../../domains/project/entities/project';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { WrapRow } from '../../../../../shared/ui/layout/containers';
import { SectionCard } from '../../../../../shared/ui/layout/section-card';
import type { GameListFiltersState } from '../../../hooks/use-game-list-filters';
import { DashboardCreateGameDialog } from './dashboard-create-game-dialog';
import { DashboardCreatePartyDialog } from './dashboard-create-party-dialog';
import { DashboardGamesCatalog } from './dashboard-games-catalog';
import { DashboardImportGameDialog } from './dashboard-import-game-dialog';

interface DashboardCreateGameForm {
  readonly description: string;
  readonly title: string;
  readonly type: GameType | null;
}

function resolveOwnerDefaultPartySettings(owner: Organization | Project | null): PartySettings | null {
  if (!owner) {
    return null;
  }

  return owner.defaultPartySettings;
}

function resolveDefaultPartySettings(
  _gameType: GameType,
  project: Project | null,
  organization: Organization | null,
): PartySettings {
  return (
    resolveOwnerDefaultPartySettings(project) ??
    resolveOwnerDefaultPartySettings(organization) ??
    DEFAULT_PARTY_SETTINGS
  );
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
  readonly selectedOrganization: Organization | null;
  readonly selectedProject: Project | null;
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
    options?: { privatePartyPassword?: string; settingsOverride?: Partial<PartySettings> },
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
  selectedOrganization,
  selectedProject,
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
  const [createPartyGame, setCreatePartyGame] = useState<DashboardGameListItem | null>(null);

  const openCreatePartyDialog = (game: DashboardGameListItem) => {
    setCreatePartyGame(game);
  };

  const closeCreatePartyDialog = () => {
    setCreatePartyGame(null);
  };

  const defaultPartySettings = createPartyGame
    ? resolveDefaultPartySettings(createPartyGame.type, selectedProject, selectedOrganization)
    : DEFAULT_PARTY_SETTINGS;

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
      <StatusBanner tone="error">{partyActionErrorMessage ? t(partyActionErrorMessage) : null}</StatusBanner>

      <DashboardGamesCatalog
        creatingPartyGameId={creatingPartyGameId}
        filters={filters}
        games={games}
        gamesErrorMessage={gamesErrorMessage}
        gameTypes={gameTypes}
        gameTypesByKey={gameTypesByKey}
        hasSelectedProject={hasSelectedProject}
        isGamesLoading={isGamesLoading}
        onCreateParty={openCreatePartyDialog}
        onManageGame={onManageGame}
        onPageChange={onPageChange}
        onSearchChange={onSearchChange}
        onSortDirectionChange={onSortDirectionChange}
        onSortFieldChange={onSortFieldChange}
        onTypeFilterChange={onTypeFilterChange}
        totalFiltered={totalFiltered}
        totalGames={totalGames}
        totalPages={totalPages}
      />

      <DashboardCreateGameDialog
        errorMessage={createGameErrorMessage}
        form={createGameForm}
        gameTypes={gameTypes}
        isCreating={isCreatingGame}
        isOpen={isCreateGameDialogOpen}
        onClose={onCloseCreateGameDialog}
        onFormChange={onCreateGameFormChange}
        onSubmit={() => void onCreateGame()}
      />

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

      <DashboardCreatePartyDialog
        defaultPartySettings={defaultPartySettings}
        descriptor={createPartyGame ? gameTypesByKey.get(createPartyGame.type) : undefined}
        game={createPartyGame}
        isCreatingParty={creatingPartyGameId !== null}
        onClose={closeCreatePartyDialog}
        onSubmit={onCreateParty}
      />
    </SectionCard>
  );
}
