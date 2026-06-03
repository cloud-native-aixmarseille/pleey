import { useEffect, useMemo, useState } from 'react';
import type { DashboardHomeActionsFacade } from '../../../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import type { DashboardWorkspaceGateway } from '../../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type { GameId } from '../../../../../domains/game/entities/game';
import type { DashboardGameListQuery } from '../../../../../domains/game/management/entities/dashboard-game-list-query';
import type { Party } from '../../../../../domains/game/party/shared/entities/party';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import type { AppIconName } from '../../../../shared/ui/icons/app-icon';
import { useCurrentParty } from '../../hooks/use-current-party';
import { useDashboardWorkspace } from '../../hooks/use-dashboard-workspace';
import { useGameListFilters } from '../../hooks/use-game-list-filters';
import { usePartySync } from '../../hooks/use-party-sync';
import { useProjectGames } from '../../hooks/use-project-games';
import { useDashboardHomeActions } from './use-dashboard-home-actions';
import { useDashboardHomePartyCreation } from './use-dashboard-home-party-creation';

type DashboardPartyGameTypeBadge = {
  readonly iconName: AppIconName;
  readonly label: string;
};

interface UseDashboardHomeScreenStateParams {
  readonly dashboardHomeActions: DashboardHomeActionsFacade;
  readonly dashboardWorkspace: DashboardWorkspaceGateway;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly resolvePartyRoute: (party: Party) => string;
}

interface DashboardCreateGameForm {
  readonly description: string;
  readonly title: string;
  readonly type: GameType | null;
}

function createEmptyGameForm(gameTypes: readonly GameTypeDescriptor[]): DashboardCreateGameForm {
  const firstSupportedGameType =
    gameTypes.find((gameType) => gameType.key === GameType.Quiz)?.key ?? gameTypes[0]?.key ?? null;

  return {
    description: '',
    title: '',
    type: firstSupportedGameType,
  };
}

function resolveImportErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';

  if (code.endsWith('_IMPORT_EMPTY_FILE')) {
    return 'dashboard.games.import.emptyError';
  }

  if (code.endsWith('_IMPORT_UNSUPPORTED_FORMAT')) {
    return 'dashboard.games.import.unsupportedFormat';
  }

  if (code.endsWith('_IMPORT_INVALID_FILE')) {
    return 'dashboard.games.import.invalidFormat';
  }

  if (code === 'dashboard.games.import.error') {
    return code;
  }

  return 'dashboard.games.import.failed';
}

export function useDashboardHomeScreenState({
  dashboardHomeActions,
  dashboardWorkspace,
  gameTypes,
  resolvePartyRoute,
}: UseDashboardHomeScreenStateParams) {
  const { t } = usePresentationTranslation();
  const workspace = useDashboardWorkspace({
    dashboardWorkspace,
  });

  const { filters, setSearch, setTypeFilter, setSortField, setSortDirection, setPage } =
    useGameListFilters();

  const gamesQuery = useMemo(() => {
    if (workspace.projectId === null) {
      return null;
    }

    return {
      projectId: workspace.projectId,
      ...filters,
    } satisfies DashboardGameListQuery;
  }, [filters, workspace.projectId]);

  const games = useProjectGames({
    query: gamesQuery,
    loadGames: (query) => dashboardWorkspace.loadProjectGameCatalog(query),
  });

  const currentParty = useCurrentParty({
    loadParties: () => dashboardWorkspace.loadUserParties(),
  });

  usePartySync({
    currentParty: currentParty.currentParty,
    upsertParty: currentParty.upsertParty,
  });

  const gameTypesByKey = useMemo(() => new Map(gameTypes.map((gt) => [gt.key, gt])), [gameTypes]);

  const partyGameTypeBadgesByGameId = useMemo(() => {
    const badgesByGameId = new Map<GameId, DashboardPartyGameTypeBadge>();

    for (const game of games.games) {
      const descriptor = gameTypesByKey.get(game.type);

      if (!descriptor) {
        continue;
      }

      badgesByGameId.set(game.gameId, {
        iconName: descriptor.iconKey as AppIconName,
        label: t(descriptor.titleKey),
      });
    }

    return badgesByGameId;
  }, [games.games, gameTypesByKey, t]);

  const resolvePartyGameTypeBadge = (gameId: GameId): DashboardPartyGameTypeBadge | null =>
    partyGameTypeBadgesByGameId.get(gameId) ?? null;

  const actions = useDashboardHomeActions({
    actionsFacade: dashboardHomeActions,
  });
  const [createGameForm, setCreateGameForm] = useState<DashboardCreateGameForm>(() =>
    createEmptyGameForm(gameTypes),
  );
  const [createGameErrorMessage, setCreateGameErrorMessage] = useState<string | null>(null);
  const [isCreateGameDialogOpen, setIsCreateGameDialogOpen] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const [importGameForm, setImportGameForm] = useState<DashboardCreateGameForm>(() =>
    createEmptyGameForm(gameTypes),
  );
  const [importGameFile, setImportGameFile] = useState<File | null>(null);
  const [importGameErrorMessage, setImportGameErrorMessage] = useState<string | null>(null);
  const [isImportGameDialogOpen, setIsImportGameDialogOpen] = useState(false);
  const [isImportingGame, setIsImportingGame] = useState(false);

  const importExampleProvider = useMemo(
    () =>
      importGameForm.type === null
        ? null
        : dashboardHomeActions.getImportExampleProvider(importGameForm.type),
    [dashboardHomeActions, importGameForm.type],
  );
  const importAcceptedFileTypes = useMemo(
    () => dashboardHomeActions.resolveImportAcceptedFileTypes(importGameForm.type),
    [dashboardHomeActions, importGameForm.type],
  );

  const partyCreation = useDashboardHomePartyCreation({
    createParty: (gameId) => dashboardWorkspace.createParty(gameId),
    onPartyCreated: currentParty.upsertParty,
    resolvePartyRoute,
    reloadGames: games.reload,
  });

  useEffect(() => {
    setCreateGameForm((current) => {
      if (gameTypes.some((gameType) => gameType.key === current.type)) {
        return current;
      }

      return createEmptyGameForm(gameTypes);
    });
    setImportGameForm((current) => {
      if (gameTypes.some((gameType) => gameType.key === current.type)) {
        return current;
      }

      return createEmptyGameForm(gameTypes);
    });
  }, [gameTypes]);

  const handleOpenCreateGameDialog = () => {
    setCreateGameForm(createEmptyGameForm(gameTypes));
    setCreateGameErrorMessage(null);
    setIsCreateGameDialogOpen(true);
  };

  const handleCloseCreateGameDialog = () => {
    setCreateGameErrorMessage(null);
    setIsCreateGameDialogOpen(false);
  };

  const handleCreateGameFormChange = (patch: Partial<DashboardCreateGameForm>) => {
    setCreateGameForm((current) => ({ ...current, ...patch }));
  };

  const handleCreateGame = async () => {
    if (
      workspace.projectId === null ||
      createGameForm.type === null ||
      createGameForm.title.trim().length === 0
    ) {
      return;
    }

    setCreateGameErrorMessage(null);
    setIsCreatingGame(true);

    try {
      await actions.handleCreateGame({
        description: createGameForm.description.trim() || null,
        projectId: workspace.projectId,
        title: createGameForm.title.trim(),
        type: createGameForm.type,
      });
      setIsCreateGameDialogOpen(false);
    } catch (createGameError) {
      setCreateGameErrorMessage(
        createGameError instanceof Error ? createGameError.message : 'dashboard.games.create.error',
      );
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleOpenImportGameDialog = () => {
    setImportGameForm(createEmptyGameForm(gameTypes));
    setImportGameFile(null);
    setImportGameErrorMessage(null);
    setIsImportGameDialogOpen(true);
  };

  const handleCloseImportGameDialog = () => {
    setImportGameErrorMessage(null);
    setIsImportGameDialogOpen(false);
  };

  const handleImportGameFormChange = (patch: Partial<DashboardCreateGameForm>) => {
    setImportGameForm((current) => ({ ...current, ...patch }));
  };

  const handleImportGameFileChange = (file: File | null) => {
    setImportGameFile(file);
    setImportGameErrorMessage(null);
  };

  const handleImportGame = async () => {
    if (
      workspace.projectId === null ||
      importGameForm.type === null ||
      importGameForm.title.trim().length === 0 ||
      importGameFile === null
    ) {
      return;
    }

    setImportGameErrorMessage(null);
    setIsImportingGame(true);

    try {
      await actions.handleCreateGameFromImport({
        description: importGameForm.description.trim() || null,
        file: importGameFile,
        projectId: workspace.projectId,
        title: importGameForm.title.trim(),
        type: importGameForm.type,
      });
      setIsImportGameDialogOpen(false);
    } catch (importGameError) {
      setImportGameErrorMessage(resolveImportErrorMessage(importGameError));
    } finally {
      setIsImportingGame(false);
    }
  };

  return {
    createGameForm,
    createGameErrorMessage,
    filters,
    gameTypesByKey,
    handleCloseCreateGameDialog,
    handleCreateGame,
    handleCreateGameFormChange,
    handleOpenImportGameDialog,
    handleCloseImportGameDialog,
    handleImportGame,
    handleImportGameFormChange,
    handleImportGameFileChange,
    importGameForm,
    importGameFile,
    importGameErrorMessage,
    importExampleProvider,
    importAcceptedFileTypes,
    isImportGameDialogOpen,
    isImportingGame,
    games: games.games,
    gamesErrorMessage: games.errorMessage,
    handleCreateParty: partyCreation.handleCreateParty,
    handleOpenCreateGameDialog,
    handleManageGame: actions.handleManageGame,
    handleManageOrganizations: actions.handleManageOrganizations,
    handleManageProjects: actions.handleManageProjects,
    handleOrganizationChange: workspace.handleOrganizationChange,
    handleOrganizationSearchChange: workspace.handleOrganizationSearchChange,
    handleLoadMoreOrganizations: workspace.handleLoadMoreOrganizations,
    handleProjectChange: workspace.handleProjectChange,
    handleProjectSearchChange: workspace.handleProjectSearchChange,
    handleLoadMoreProjects: workspace.handleLoadMoreProjects,
    creatingPartyGameId: partyCreation.creatingPartyGameId,
    isGamesLoading: games.isLoading,
    isOrganizationsLoading: workspace.isOrganizationsLoading,
    isLoadingMoreOrganizations: workspace.isLoadingMoreOrganizations,
    currentParty: currentParty.currentParty,
    isCurrentPartyLoading: currentParty.isLoading,
    isCreateGameDialogOpen,
    isCreatingGame,
    isWorkspaceLoading: workspace.isWorkspaceLoading,
    isLoadingMoreProjects: workspace.isLoadingMoreProjects,
    organizationDashboard: workspace.organizationDashboard,
    organizationId: workspace.organizationId,
    hasMoreOrganizations: workspace.hasMoreOrganizations,
    organizations: workspace.organizations,
    overallCount: games.overallCount,
    currentPartyErrorMessage: currentParty.errorMessage,
    partyActionErrorMessage: partyCreation.partyActionErrorMessage,
    projectId: workspace.projectId,
    hasMoreProjects: workspace.hasMoreProjects,
    projects: workspace.projects,
    resolvePartyGameTypeBadge,
    selectedOrganization: workspace.selectedOrganization,
    selectedProject: workspace.selectedProject,
    setPage,
    setSearch,
    setSortDirection,
    setSortField,
    setTypeFilter,
    totalCount: games.totalCount,
    totalPages: games.totalPages,
    workspaceErrorMessage: workspace.errorMessage,
  };
}
