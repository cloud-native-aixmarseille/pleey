import type { DashboardWorkspaceGateway } from '../../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type { Organization } from '../../../../../domains/organization/entities/organization';
import type { CreateOrganizationCommand } from '../../../../../domains/organization/ports/organization-repository';
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
import { CreateOrganizationForm } from './components/create-organization-form';
import { OrganizationOverviewPanel } from './components/organization-overview-panel';
import { OrganizationProjectsSection } from './components/organization-projects-section';
import { ProjectFormDialog } from './components/project-form-dialog';
import { ProjectRemovalDialog } from './components/project-removal-dialog';
import { useOrganizationScreenState } from './use-organization-screen-state';

interface OrganizationScreenProps {
  readonly dashboardWorkspace: DashboardWorkspaceGateway;
  readonly createOrganization: (command: CreateOrganizationCommand) => Promise<Organization>;
  readonly createProject: (command: CreateProjectCommand) => Promise<Project>;
  readonly updateProject: (command: UpdateProjectCommand) => Promise<Project>;
  readonly deleteProject: (command: DeleteProjectCommand) => Promise<void>;
}

export function OrganizationScreen({
  dashboardWorkspace,
  createOrganization,
  createProject,
  updateProject,
  deleteProject,
}: OrganizationScreenProps) {
  const { t } = usePresentationTranslation();
  const {
    actionErrorMessage,
    availableMigrationProjects,
    cancelProjectRemoval,
    closeCreateProjectDialog,
    closeEditProjectDialog,
    editingProject,
    handleConfirmProjectRemoval,
    handleCreateProject,
    handleOrganizationChange,
    handleOrganizationCreated,
    handleProjectMutationCompleted,
    handleUpdateProject,
    isCreateProjectOpen,
    isDeletingProject,
    isOrganizationsLoading,
    migrationProjectId,
    openCreateProjectDialog,
    openEditProjectDialog,
    openRemoveProjectDialog,
    organizationDashboard,
    organizationId,
    organizations,
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
    updateProject,
  });

  return (
    <ContentStack gap="xl">
      <SubpageHeader
        kicker={t('organization.management.eyebrow')}
        title={t('organization.management.title')}
        subtitle={t('organization.management.subtitle')}
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
        createButtonLabel={t('organization.management.projectsCreateButton')}
        eyebrow={t('organization.management.projectsEyebrow')}
        onCreateProject={openCreateProjectDialog}
        onEditProject={openEditProjectDialog}
        onRemoveProject={openRemoveProjectDialog}
        projects={projects}
        selectedProjectId={selectedProject?.id ?? null}
        title={t('organization.management.projectsTitle')}
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
            ? t('organization.management.projectsRemoveSubmitting')
            : t('organization.management.projectsRemoveConfirm')
        }
        description={t('organization.management.projectsRemoveMigrationDescription')}
        isDeletingProject={isDeletingProject}
        isOpen={projectPendingRemoval !== null}
        label={t('organization.management.projectsRemoveMigrationLabel')}
        message={t('organization.management.projectsRemoveDialogMessage', {
          project: projectPendingRemoval?.name ?? '',
        })}
        migrationProjectId={migrationProjectId}
        onCancel={cancelProjectRemoval}
        onConfirm={handleConfirmProjectRemoval}
        onMigrationProjectChange={setMigrationProjectId}
        placeholder={t('organization.management.projectsRemoveMigrationPlaceholder')}
        title={t('organization.management.projectsRemoveDialogTitle')}
      />
    </ContentStack>
  );
}
