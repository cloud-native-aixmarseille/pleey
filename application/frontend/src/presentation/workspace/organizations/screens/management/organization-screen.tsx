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
import type { DashboardWorkspaceSelectionGateway } from '../../../dashboard/hooks/use-dashboard-workspace';
import { CreateOrganizationForm } from './components/create-organization-form';
import { OrganizationOverviewPanel } from './components/organization-overview-panel';
import { OrganizationProjectsSection } from './components/organization-projects-section';
import { ProjectFormDialog } from './components/project-form-dialog';
import { ProjectRemovalDialog } from './components/project-removal-dialog';
import { useOrganizationScreenState } from './use-organization-screen-state';

interface OrganizationScreenProps {
  readonly dashboardWorkspace: DashboardWorkspaceSelectionGateway;
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
