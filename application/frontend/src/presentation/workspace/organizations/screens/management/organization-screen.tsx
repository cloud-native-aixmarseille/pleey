import type { Organization } from '../../../../../domains/organization/entities/organization';
import { OrganizationRole } from '../../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../../domains/organization/entities/organization-member';
import type {
  AddOrganizationMemberCommand,
  CreateOrganizationCommand,
  ListOrganizationMembersQuery,
  UpdateOrganizationMemberRoleCommand,
} from '../../../../../domains/organization/ports/organization-repository';
import type { Project } from '../../../../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  UpdateProjectCommand,
} from '../../../../../domains/project/ports/project-repository';
import type { PaginatedResult } from '../../../../../domains/shared/value-objects/paginated-result';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import { SubpageHeader } from '../../../../shared/ui/layout/subpage-header';
import type { DashboardWorkspaceSelectionGateway } from '../../../dashboard/hooks/use-dashboard-workspace';
import type { PaginationViewModel } from '../../../shared/components/pagination-bar';
import { CreateOrganizationForm } from './components/create-organization-form';
import { OrganizationMemberRemovalDialog } from './components/organization-member-removal-dialog';
import { OrganizationMembersSection } from './components/organization-members-section';
import { OrganizationOverviewPanel } from './components/organization-overview-panel';
import { OrganizationProjectDialogs } from './components/organization-project-dialogs';
import { OrganizationProjectsSection } from './components/organization-projects-section';
import { createPaginationViewModel } from './organization-screen-pagination';
import { useOrganizationScreenState } from './use-organization-screen-state';

interface OrganizationScreenProps {
  readonly dashboardWorkspace: DashboardWorkspaceSelectionGateway;
  readonly createOrganization: (command: CreateOrganizationCommand) => Promise<Organization>;
  readonly listOrganizationMembers: (
    query: ListOrganizationMembersQuery,
  ) => Promise<PaginatedResult<OrganizationMember>>;
  readonly addOrganizationMember: (
    command: AddOrganizationMemberCommand,
  ) => Promise<OrganizationMember>;
  readonly removeOrganizationMember: (member: OrganizationMember) => Promise<void>;
  readonly updateOrganizationMemberRole: (
    command: UpdateOrganizationMemberRoleCommand,
  ) => Promise<OrganizationMember>;
  readonly createProject: (command: CreateProjectCommand) => Promise<Project>;
  readonly updateProject: (command: UpdateProjectCommand) => Promise<Project>;
  readonly deleteProject: (command: DeleteProjectCommand) => Promise<void>;
}

export function OrganizationScreen({
  dashboardWorkspace,
  createOrganization,
  listOrganizationMembers,
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
  createProject,
  updateProject,
  deleteProject,
}: OrganizationScreenProps) {
  const { t } = usePresentationTranslation();
  const {
    actionErrorMessage,
    availableMigrationProjects,
    cancelOrganizationMemberRemoval,
    cancelProjectRemoval,
    canManageMembers,
    closeCreateProjectDialog,
    closeEditProjectDialog,
    editingProject,
    handleConfirmOrganizationMemberRemoval,
    handleConfirmProjectRemoval,
    handleAddOrganizationMember,
    handleCreateProject,
    handleMemberFormChange,
    handleMemberPageChange,
    handleMemberSearchChange,
    handleOrganizationChange,
    handleOrganizationSearchChange,
    handleOrganizationCreated,
    handleLoadMoreOrganizations,
    handleProjectSearchChange,
    handleProjectPageChange,
    handleProjectMutationCompleted,
    handleUpdateOrganizationMemberRole,
    handleUpdateProject,
    hasMoreOrganizations,
    isAddingMember,
    isCreateProjectOpen,
    isDeletingProject,
    isMembersLoading,
    isLoadingMoreProjects,
    isLoadingMoreOrganizations,
    isOrganizationsLoading,
    isWorkspaceLoading,
    memberErrorMessage,
    memberForm,
    memberPage,
    memberSearch,
    memberTotalPages,
    memberPendingRemoval,
    migrationProjectLabel,
    migrationProjectId,
    openCreateProjectDialog,
    openEditProjectDialog,
    openRemoveOrganizationMemberDialog,
    openRemoveProjectDialog,
    organizationDashboard,
    organizationId,
    organizationMembers,
    organizations,
    pendingRoleUpdateMemberId,
    pendingRemovalMemberId,
    errorMessage,
    hasMoreProjects,
    projectPage,
    projectPendingRemoval,
    projectSearch,
    projectTotalCount,
    projectTotalPages,
    projects,
    selectedOrganization,
    selectedProject,
    handleLoadMoreProjects,
    handleMigrationProjectChange,
  } = useOrganizationScreenState({
    createProject,
    deleteProject,
    dashboardWorkspace,
    listOrganizationMembers,
    addOrganizationMember,
    removeOrganizationMember,
    updateOrganizationMemberRole,
    updateProject,
  });

  const projectPagination: PaginationViewModel = createPaginationViewModel({
    currentPage: projectPage,
    label: t('project.management.pagination.label'),
    nextLabel: t('project.management.pagination.next'),
    onPageChange: handleProjectPageChange,
    pageOfLabel: t('project.management.pagination.pageOf', {
      current: String(projectPage),
      total: String(projectTotalPages),
    }),
    previousLabel: t('project.management.pagination.previous'),
    totalPages: projectTotalPages,
  });

  const memberPagination: PaginationViewModel = createPaginationViewModel({
    currentPage: memberPage,
    label: t('organization.management.members.pagination.label'),
    nextLabel: t('organization.management.members.pagination.next'),
    onPageChange: handleMemberPageChange,
    pageOfLabel: t('organization.management.members.pagination.pageOf', {
      current: String(memberPage),
      total: String(memberTotalPages),
    }),
    previousLabel: t('organization.management.members.pagination.previous'),
    totalPages: memberTotalPages,
  });

  return (
    <ContentStack gap="xl">
      <SubpageHeader
        kicker={t('organization.management.header.eyebrow')}
        title={t('organization.management.header.title')}
        subtitle={t('organization.management.header.subtitle')}
        actions={
          <CreateOrganizationForm
            onSubmit={createOrganization}
            onCreated={handleOrganizationCreated}
          />
        }
      />

      <StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>

      <OrganizationOverviewPanel
        organizations={organizations}
        hasMoreOrganizations={hasMoreOrganizations}
        organizationId={organizationId}
        organizationEmptyLabel={t('dashboard.workspace.organizationEmpty')}
        organizationLoadingLabel={t('dashboard.workspace.organizationLoading')}
        organizationNoResultsLabel={t('dashboard.workspace.organizationNoResults')}
        organizationSearchLabel={t('dashboard.workspace.organizationSearchLabel')}
        organizationSearchPlaceholder={t('dashboard.workspace.organizationSearchPlaceholder')}
        selectedOrganization={selectedOrganization}
        dashboard={organizationDashboard}
        isOrganizationsLoading={isOrganizationsLoading}
        isLoadingMoreOrganizations={isLoadingMoreOrganizations}
        onOrganizationChange={handleOrganizationChange}
        onOrganizationSearchChange={handleOrganizationSearchChange}
        onLoadMoreOrganizations={handleLoadMoreOrganizations}
      />

      <OrganizationProjectsSection
        actionErrorMessage={actionErrorMessage ? t(actionErrorMessage) : null}
        canCreateProject={selectedOrganization !== null}
        canRemoveProjects={projectTotalCount > 1}
        createButtonLabel={t('project.management.section.createButton')}
        eyebrow={t('project.management.section.eyebrow')}
        onCreateProject={openCreateProjectDialog}
        onEditProject={openEditProjectDialog}
        onProjectSearchChange={handleProjectSearchChange}
        onRemoveProject={openRemoveProjectDialog}
        pagination={projectPagination}
        projects={projects}
        projectSearchLabel={t('project.management.searchLabel')}
        projectSearchPlaceholder={t('project.management.searchPlaceholder')}
        projectSearchValue={projectSearch}
        searchDisabled={selectedOrganization === null}
        selectedProjectId={selectedProject?.id ?? null}
        title={t('project.management.section.title')}
      />

      <OrganizationMembersSection
        addButtonLabel={t('organization.management.members.addButton')}
        addDisabled={selectedOrganization === null}
        addForm={memberForm}
        canManageMembers={canManageMembers}
        emptyLabel={t('organization.management.members.empty')}
        errorMessage={memberErrorMessage ? t(memberErrorMessage) : null}
        isAddingMember={isAddingMember}
        isLoading={isMembersLoading}
        members={organizationMembers}
        onAddFormChange={handleMemberFormChange}
        onAddMember={handleAddOrganizationMember}
        onMemberSearchChange={handleMemberSearchChange}
        onRemoveMember={openRemoveOrganizationMemberDialog}
        onUpdateMemberRole={handleUpdateOrganizationMemberRole}
        pendingRoleUpdateMemberId={pendingRoleUpdateMemberId}
        pendingRemovalMemberId={pendingRemovalMemberId}
        pagination={memberPagination}
        removeButtonLabel={t('organization.management.members.removeButton')}
        roleLabel={t('organization.management.members.roleLabel')}
        roleLabels={{
          [OrganizationRole.OWNER]: t('organization.management.members.roles.owner'),
          [OrganizationRole.MANAGER]: t('organization.management.members.roles.manager'),
          [OrganizationRole.MEMBER]: t('organization.management.members.roles.member'),
        }}
        searchDisabled={selectedOrganization === null}
        searchLabel={t('organization.management.members.searchLabel')}
        searchPlaceholder={t('organization.management.members.searchPlaceholder')}
        searchValue={memberSearch}
        selectedOrganizationRole={selectedOrganization?.role ?? null}
        selectedOrganizationName={selectedOrganization?.name ?? null}
        title={t('organization.management.members.title')}
        usernameOrEmailLabel={t('organization.management.members.usernameOrEmailLabel')}
        usernameOrEmailPlaceholder={t('organization.management.members.usernameOrEmailPlaceholder')}
      />

      <OrganizationMemberRemovalDialog
        cancelLabel={t('common.cancel')}
        confirmDisabled={pendingRemovalMemberId !== null}
        confirmLabel={t('organization.management.members.removal.confirm')}
        isOpen={memberPendingRemoval !== null}
        message={
          memberPendingRemoval
            ? t('organization.management.members.removal.dialogMessage', {
                member: String(memberPendingRemoval.userId),
                organization: selectedOrganization?.name ?? '',
              })
            : ''
        }
        onCancel={cancelOrganizationMemberRemoval}
        onConfirm={handleConfirmOrganizationMemberRemoval}
        title={t('organization.management.members.removal.dialogTitle')}
      />

      <OrganizationProjectDialogs
        availableMigrationProjects={availableMigrationProjects}
        cancelProjectRemoval={cancelProjectRemoval}
        closeCreateProjectDialog={closeCreateProjectDialog}
        closeEditProjectDialog={closeEditProjectDialog}
        editingProject={editingProject}
        handleConfirmProjectRemoval={handleConfirmProjectRemoval}
        handleCreateProject={handleCreateProject}
        handleLoadMoreProjects={handleLoadMoreProjects}
        handleMigrationProjectChange={handleMigrationProjectChange}
        handleProjectMutationCompleted={handleProjectMutationCompleted}
        handleProjectSearchChange={handleProjectSearchChange}
        handleUpdateProject={handleUpdateProject}
        hasMoreProjects={hasMoreProjects}
        isCreateProjectOpen={isCreateProjectOpen}
        isDeletingProject={isDeletingProject}
        isLoadingMoreProjects={isLoadingMoreProjects}
        isWorkspaceLoading={isWorkspaceLoading}
        migrationProjectId={migrationProjectId}
        migrationProjectLabel={migrationProjectLabel}
        projectPendingRemoval={projectPendingRemoval}
        projectTotalCount={projectTotalCount}
        selectedOrganizationName={selectedOrganization?.name ?? null}
      />
    </ContentStack>
  );
}
