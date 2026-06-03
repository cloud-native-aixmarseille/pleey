import type { DashboardHomeActionsFacade } from '../../../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import type { DashboardWorkspaceGateway } from '../../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type { Party } from '../../../../../domains/game/party/shared/entities/party';
import type { GameTypeDescriptor } from '../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import { DashboardActivePartySection } from './components/dashboard-active-party-section';
import { DashboardCommandBar } from './components/dashboard-command-bar';
import { DashboardGamesSection } from './components/dashboard-games-section';
import { useDashboardHomeScreenState } from './use-dashboard-home-screen-state';

interface DashboardHomeScreenProps {
  readonly dashboardHomeActions: DashboardHomeActionsFacade;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly dashboardWorkspace: DashboardWorkspaceGateway;
  readonly resolvePartyRoute: (party: Party) => string;
}

export function DashboardHomeScreen({
  dashboardHomeActions,
  gameTypes,
  dashboardWorkspace,
  resolvePartyRoute,
}: DashboardHomeScreenProps) {
  const { t } = usePresentationTranslation();
  const {
    organizations,
    hasMoreOrganizations,
    projects,
    organizationDashboard,
    organizationId,
    selectedOrganization,
    projectId,
    hasMoreProjects,
    selectedProject,
    isOrganizationsLoading,
    isLoadingMoreOrganizations,
    isWorkspaceLoading,
    isLoadingMoreProjects,
    workspaceErrorMessage,
    games,
    totalCount,
    overallCount,
    totalPages,
    isGamesLoading,
    gamesErrorMessage,
    createGameForm,
    createGameErrorMessage,
    currentParty,
    isCurrentPartyLoading,
    currentPartyErrorMessage,
    creatingPartyGameId,
    isCreateGameDialogOpen,
    isCreatingGame,
    partyActionErrorMessage,
    gameTypesByKey,
    resolvePartyGameTypeBadge,
    filters,
    setSearch,
    setTypeFilter,
    setSortField,
    setSortDirection,
    setPage,
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
    handleManageGame,
    handleManageOrganizations,
    handleManageProjects,
    handleOpenCreateGameDialog,
    handleCreateParty,
    handleOrganizationChange,
    handleOrganizationSearchChange,
    handleLoadMoreOrganizations,
    handleProjectChange,
    handleProjectSearchChange,
    handleLoadMoreProjects,
  } = useDashboardHomeScreenState({
    dashboardHomeActions,
    gameTypes,
    dashboardWorkspace,
    resolvePartyRoute,
  });

  return (
    <ContentStack gap="lg">
      <DashboardCommandBar
        organizations={organizations}
        hasMoreOrganizations={hasMoreOrganizations}
        projects={projects}
        organizationId={organizationId}
        selectedOrganizationLabel={selectedOrganization?.name ?? null}
        projectId={projectId}
        selectedProjectLabel={selectedProject?.name ?? null}
        hasMoreProjects={hasMoreProjects}
        isOrganizationsLoading={isOrganizationsLoading}
        isLoadingMoreOrganizations={isLoadingMoreOrganizations}
        isWorkspaceLoading={isWorkspaceLoading}
        isLoadingMoreProjects={isLoadingMoreProjects}
        onOrganizationChange={handleOrganizationChange}
        onOrganizationSearchChange={handleOrganizationSearchChange}
        onLoadMoreOrganizations={handleLoadMoreOrganizations}
        onProjectChange={handleProjectChange}
        onProjectSearchChange={handleProjectSearchChange}
        onLoadMoreProjects={handleLoadMoreProjects}
        onManageOrganizations={handleManageOrganizations}
        onManageProjects={handleManageProjects}
        dashboard={organizationDashboard}
      />

      <StatusBanner tone="error">
        {workspaceErrorMessage ? t(workspaceErrorMessage) : null}
      </StatusBanner>

      <DashboardActivePartySection
        currentParty={currentParty}
        currentPartyErrorMessage={currentPartyErrorMessage}
        isCurrentPartyLoading={isCurrentPartyLoading}
        partyRouteResolver={resolvePartyRoute}
        resolvePartyGameTypeBadge={resolvePartyGameTypeBadge}
      />

      <DashboardGamesSection
        hasSelectedProject={selectedProject !== null}
        creatingPartyGameId={creatingPartyGameId}
        createGameForm={createGameForm}
        createGameErrorMessage={createGameErrorMessage}
        games={games}
        gameTypes={gameTypes}
        gameTypesByKey={gameTypesByKey}
        filters={filters}
        isCreateGameDialogOpen={isCreateGameDialogOpen}
        isCreatingGame={isCreatingGame}
        importGameForm={importGameForm}
        importGameFile={importGameFile}
        importGameErrorMessage={importGameErrorMessage}
        importExampleProvider={importExampleProvider}
        importAcceptedFileTypes={importAcceptedFileTypes}
        isImportGameDialogOpen={isImportGameDialogOpen}
        isImportingGame={isImportingGame}
        isGamesLoading={isGamesLoading}
        gamesErrorMessage={gamesErrorMessage}
        partyActionErrorMessage={partyActionErrorMessage}
        totalFiltered={totalCount}
        totalGames={overallCount}
        totalPages={totalPages}
        onCloseCreateGameDialog={handleCloseCreateGameDialog}
        onCreateGame={handleCreateGame}
        onCreateGameFormChange={handleCreateGameFormChange}
        onOpenCreateGameDialog={handleOpenCreateGameDialog}
        onCloseImportGameDialog={handleCloseImportGameDialog}
        onImportGame={handleImportGame}
        onImportGameFormChange={handleImportGameFormChange}
        onImportGameFileChange={handleImportGameFileChange}
        onOpenImportGameDialog={handleOpenImportGameDialog}
        onCreateParty={handleCreateParty}
        onSearchChange={setSearch}
        onTypeFilterChange={setTypeFilter}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        onPageChange={setPage}
        onManageGame={handleManageGame}
      />
    </ContentStack>
  );
}
