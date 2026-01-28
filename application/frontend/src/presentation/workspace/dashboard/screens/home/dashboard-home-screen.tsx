import { useMemo } from 'react';
import type { DashboardHomeActionsFacade } from '../../../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import type { DashboardWorkspaceGateway } from '../../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type { DashboardGameListPage } from '../../../../../domains/game-catalog/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../../../domains/game-catalog/entities/dashboard-game-list-query';
import type { GameTypeDescriptor } from '../../../../../domains/game-catalog/entities/game-type-catalog';
import type { DashboardActiveSessionItem } from '../../../../../domains/game-session/entities/active-game-session';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { usePresentationNavigate } from '../../../../shared/routing/router';
import { StatusBanner } from '../../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import { useDashboardActiveSession } from '../../hooks/use-dashboard-active-session';
import { useDashboardWorkspace } from '../../hooks/use-dashboard-workspace';
import { useGameListFilters } from '../../hooks/use-game-list-filters';
import { useProjectGames } from '../../hooks/use-project-games';
import { DashboardActiveSessionBanner } from './components/dashboard-active-session-banner';
import { DashboardCommandBar } from './components/dashboard-command-bar';
import { DashboardGamesSection } from './components/dashboard-games-section';
import { useDashboardHomeActions } from './use-dashboard-home-actions';

interface DashboardHomeScreenProps {
  readonly dashboardHomeActions: DashboardHomeActionsFacade;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly loadActiveSessions: () => Promise<DashboardActiveSessionItem[]>;
  readonly leaveCurrentPlayerSession: () => Promise<boolean>;
  readonly loadProjectDashboardGames: (
    query: DashboardGameListQuery,
  ) => Promise<DashboardGameListPage>;
  readonly resumeGameSession: (sessionId: number) => Promise<DashboardActiveSessionItem>;
  readonly stopGameSession: (sessionId: number) => Promise<DashboardActiveSessionItem>;
  readonly dashboardWorkspace: DashboardWorkspaceGateway;
}

export function DashboardHomeScreen({
  dashboardHomeActions,
  gameTypes,
  loadActiveSessions,
  leaveCurrentPlayerSession,
  loadProjectDashboardGames,
  resumeGameSession,
  stopGameSession,
  dashboardWorkspace,
}: DashboardHomeScreenProps) {
  const { t } = usePresentationTranslation();
  const navigate = usePresentationNavigate();

  const {
    organizations,
    projects,
    organizationDashboard,
    organizationId,
    projectId,
    selectedProject,
    isOrganizationsLoading,
    isWorkspaceLoading,
    errorMessage,
    handleOrganizationChange,
    handleProjectChange,
  } = useDashboardWorkspace({
    dashboardWorkspace,
  });

  const { filters, setSearch, setTypeFilter, setSortField, setSortDirection, setPage } =
    useGameListFilters();

  const gamesQuery = useMemo(() => {
    if (projectId === null) {
      return null;
    }

    return {
      projectId,
      ...filters,
    } satisfies DashboardGameListQuery;
  }, [filters, projectId]);

  const {
    games,
    totalCount,
    overallCount,
    totalPages,
    isLoading: isGamesLoading,
    errorMessage: gamesErrorMessage,
  } = useProjectGames({ query: gamesQuery, loadGames: loadProjectDashboardGames });

  const {
    session,
    isLoading: isSessionsLoading,
    errorMessage: sessionsErrorMessage,
    isActionPending,
    handleResumeSession,
    handleStopSession,
  } = useDashboardActiveSession({
    loadActiveSessions,
    leaveCurrentPlayerSession,
    resumeGameSession,
    stopGameSession,
  });

  const gameTypesByKey = useMemo(() => new Map(gameTypes.map((gt) => [gt.key, gt])), [gameTypes]);
  const gamesById = useMemo(() => new Map(games.map((game) => [game.gameId, game])), [games]);

  const {
    isLaunching,
    launchErrorMessage,
    handleOpenSession,
    handleManageGame,
    handleLaunchSession,
    handleManageOrganizations,
    handleManageProjects,
  } = useDashboardHomeActions({
    actionsFacade: dashboardHomeActions,
    navigate,
  });

  const hasActiveSession = !isSessionsLoading && session !== null;

  return (
    <ContentStack gap="lg">
      <DashboardCommandBar
        organizations={organizations}
        projects={projects}
        organizationId={organizationId}
        projectId={projectId}
        isOrganizationsLoading={isOrganizationsLoading}
        isWorkspaceLoading={isWorkspaceLoading}
        onOrganizationChange={handleOrganizationChange}
        onProjectChange={handleProjectChange}
        onManageOrganizations={handleManageOrganizations}
        onManageProjects={handleManageProjects}
        dashboard={organizationDashboard}
      />

      <StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>

      {sessionsErrorMessage ? (
        <StatusBanner tone="error">{t(sessionsErrorMessage)}</StatusBanner>
      ) : null}

      {launchErrorMessage ? (
        <StatusBanner tone="error">{t(launchErrorMessage)}</StatusBanner>
      ) : null}

      {hasActiveSession ? (
        <DashboardActiveSessionBanner
          gameTypeDescriptor={gameTypesByKey.get(gamesById.get(session.gameId)?.type ?? '')}
          isActionPending={isActionPending}
          onOpenSession={handleOpenSession}
          onResumeSession={handleResumeSession}
          onStopSession={handleStopSession}
          session={session}
          sessionGame={gamesById.get(session.gameId) ?? null}
        />
      ) : null}

      <DashboardGamesSection
        hasSelectedProject={selectedProject !== null}
        games={games}
        gameTypes={gameTypes}
        gameTypesByKey={gameTypesByKey}
        filters={filters}
        isGamesLoading={isGamesLoading}
        isLaunchDisabled={hasActiveSession || isLaunching}
        launchDisabledReason={
          hasActiveSession ? t('dashboard.games.actions.launchDisabledActiveSession') : null
        }
        gamesErrorMessage={gamesErrorMessage}
        totalFiltered={totalCount}
        totalGames={overallCount}
        totalPages={totalPages}
        onSearchChange={setSearch}
        onTypeFilterChange={setTypeFilter}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        onPageChange={setPage}
        onLaunchSession={(game) => void handleLaunchSession(game)}
        onManageGame={handleManageGame}
      />
    </ContentStack>
  );
}
