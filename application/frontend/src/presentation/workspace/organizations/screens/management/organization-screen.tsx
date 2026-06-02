import type { Organization } from '../../../../../domains/organization/entities/organization';
import { OrganizationRole } from '../../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../../domains/organization/entities/organization-member';
import type {
  AddOrganizationMemberCommand,
  CreateOrganizationCommand,
  UpdateOrganizationMemberRoleCommand,
} from '../../../../../domains/organization/ports/organization-repository';
import type { Project } from '../../../../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  UpdateProjectCommand,
} from '../../../../../domains/project/ports/project-repository';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import { SubpageHeader } from '../../../../shared/ui/layout/subpage-header';
import type { DashboardWorkspaceSelectionGateway } from '../../../dashboard/hooks/use-dashboard-workspace';
import { CreateOrganizationForm } from './components/create-organization-form';
import { OrganizationMemberRemovalDialog } from './components/organization-member-removal-dialog';
import { OrganizationMembersSection } from './components/organization-members-section';
import { OrganizationOverviewPanel } from './components/organization-overview-panel';
import { OrganizationProjectsSection } from './components/organization-projects-section';
import { ProjectFormDialog } from './components/project-form-dialog';
import { ProjectRemovalDialog } from './components/project-removal-dialog';
import { useOrganizationScreenState } from './use-organization-screen-state';

interface OrganizationScreenProps {
  readonly dashboardWorkspace: DashboardWorkspaceSelectionGateway;
  readonly createOrganization: (command: CreateOrganizationCommand) => Promise<Organization>;
  readonly listOrganizationMembers: (
    organizationId: Organization['id'],
  ) => Promise<OrganizationMember[]>;
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
    handleOrganizationChange,
    handleOrganizationCreated,
    handleProjectMutationCompleted,
    handleUpdateOrganizationMemberRole,
    handleUpdateProject,
    isAddingMember,
    isCreateProjectOpen,
    isDeletingProject,
    isMembersLoading,
    isOrganizationsLoading,
    memberErrorMessage,
    memberForm,
    memberPendingRemoval,
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
    projectPendingRemoval,
    projects,
    selectedOrganization,
    selectedProject,
    setMigrationProjectId,
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
        organizationId={organizationId}
        selectedOrganization={selectedOrganization}
        dashboard={organizationDashboard}
        isOrganizationsLoading={isOrganizationsLoading}
        onOrganizationChange={handleOrganizationChange}
      />

      <OrganizationProjectsSection
        actionErrorMessage={actionErrorMessage ? t(actionErrorMessage) : null}
        canCreateProject={selectedOrganization !== null}
        createButtonLabel={t('project.management.section.createButton')}
        eyebrow={t('project.management.section.eyebrow')}
        onCreateProject={openCreateProjectDialog}
        onEditProject={openEditProjectDialog}
        onRemoveProject={openRemoveProjectDialog}
        projects={projects}
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
        onRemoveMember={openRemoveOrganizationMemberDialog}
        onUpdateMemberRole={handleUpdateOrganizationMemberRole}
        pendingRoleUpdateMemberId={pendingRoleUpdateMemberId}
        pendingRemovalMemberId={pendingRemovalMemberId}
        removeButtonLabel={t('organization.management.members.removeButton')}
        roleLabel={t('organization.management.members.roleLabel')}
        roleLabels={{
          [OrganizationRole.OWNER]: t('organization.management.members.roles.owner'),
          [OrganizationRole.MANAGER]: t('organization.management.members.roles.manager'),
          [OrganizationRole.MEMBER]: t('organization.management.members.roles.member'),
        }}
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

      <ProjectFormDialog
        isOpen={isCreateProjectOpen}
        mode="create"
        onClose={closeCreateProjectDialog}
        onSubmit={handleCreateProject}
        onSubmitted={handleProjectMutationCompleted}
        organizationName={selectedOrganization?.name ?? null}
        project={null}
      />

      <ProjectFormDialog
        isOpen={editingProject !== null}
        mode="edit"
        onClose={closeEditProjectDialog}
        onSubmit={handleUpdateProject}
        onSubmitted={handleProjectMutationCompleted}
        organizationName={selectedOrganization?.name ?? null}
        project={editingProject}
      />

      <ProjectRemovalDialog
        availableMigrationProjects={availableMigrationProjects}
        cancelLabel={t('common.cancel')}
        confirmDisabled={availableMigrationProjects.length > 0 && migrationProjectId === null}
        confirmLabel={
          isDeletingProject
            ? t('project.management.removal.submitting')
            : t('project.management.removal.confirm')
        }
        description={t('project.management.removal.migrationDescription')}
        isDeletingProject={isDeletingProject}
        isOpen={projectPendingRemoval !== null}
        label={t('project.management.removal.migrationLabel')}
        message={t('project.management.removal.dialogMessage', {
          project: projectPendingRemoval?.name ?? '',
        })}
        migrationProjectId={migrationProjectId}
        onCancel={cancelProjectRemoval}
        onConfirm={handleConfirmProjectRemoval}
        onMigrationProjectChange={setMigrationProjectId}
        placeholder={t('project.management.removal.migrationPlaceholder')}
        title={t('project.management.removal.dialogTitle')}
      />
    </ContentStack>
  );
}
