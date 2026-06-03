import type { Project } from '../../../../../../domains/project/entities/project';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { ProjectFormDialog } from './project-form-dialog';
import { ProjectRemovalDialog } from './project-removal-dialog';

interface OrganizationProjectDialogsProps {
  readonly availableMigrationProjects: readonly Project[];
  readonly cancelProjectRemoval: () => void;
  readonly closeCreateProjectDialog: () => void;
  readonly closeEditProjectDialog: () => void;
  readonly editingProject: Project | null;
  readonly handleConfirmProjectRemoval: () => void;
  readonly handleCreateProject: (values: {
    name: string;
    description: string | null;
  }) => Promise<Project>;
  readonly handleLoadMoreProjects: () => void;
  readonly handleMigrationProjectChange: (projectId: Project['id'] | null) => void;
  readonly handleProjectMutationCompleted: (project: Project) => void;
  readonly handleProjectSearchChange: (value: string) => void;
  readonly handleUpdateProject: (values: {
    name: string;
    description: string | null;
  }) => Promise<Project>;
  readonly hasMoreProjects: boolean;
  readonly isCreateProjectOpen: boolean;
  readonly isDeletingProject: boolean;
  readonly isLoadingMoreProjects: boolean;
  readonly isWorkspaceLoading: boolean;
  readonly migrationProjectId: Project['id'] | null;
  readonly migrationProjectLabel: string | null;
  readonly projectPendingRemoval: Project | null;
  readonly projectTotalCount: number;
  readonly selectedOrganizationName: string | null;
}

export function OrganizationProjectDialogs({
  availableMigrationProjects,
  cancelProjectRemoval,
  closeCreateProjectDialog,
  closeEditProjectDialog,
  editingProject,
  handleConfirmProjectRemoval,
  handleCreateProject,
  handleLoadMoreProjects,
  handleMigrationProjectChange,
  handleProjectMutationCompleted,
  handleProjectSearchChange,
  handleUpdateProject,
  hasMoreProjects,
  isCreateProjectOpen,
  isDeletingProject,
  isLoadingMoreProjects,
  isWorkspaceLoading,
  migrationProjectId,
  migrationProjectLabel,
  projectPendingRemoval,
  projectTotalCount,
  selectedOrganizationName,
}: OrganizationProjectDialogsProps) {
  const { t } = usePresentationTranslation();

  return (
    <>
      <ProjectFormDialog
        isOpen={isCreateProjectOpen}
        mode="create"
        onClose={closeCreateProjectDialog}
        onSubmit={handleCreateProject}
        onSubmitted={handleProjectMutationCompleted}
        organizationName={selectedOrganizationName}
        project={null}
      />

      <ProjectFormDialog
        isOpen={editingProject !== null}
        mode="edit"
        onClose={closeEditProjectDialog}
        onSubmit={handleUpdateProject}
        onSubmitted={handleProjectMutationCompleted}
        organizationName={selectedOrganizationName}
        project={editingProject}
      />

      <ProjectRemovalDialog
        availableMigrationProjects={availableMigrationProjects}
        cancelLabel={t('common.cancel')}
        confirmDisabled={projectTotalCount > 1 && migrationProjectId === null}
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
        emptyLabel={t('dashboard.workspace.projectEmpty')}
        hasMoreMigrationProjects={hasMoreProjects}
        migrationProjectId={migrationProjectId}
        isLoadingMigrationProjects={isWorkspaceLoading}
        isLoadingMoreMigrationProjects={isLoadingMoreProjects}
        loadingLabel={t('dashboard.workspace.projectLoading')}
        onCancel={cancelProjectRemoval}
        onConfirm={handleConfirmProjectRemoval}
        onMigrationProjectChange={handleMigrationProjectChange}
        onMigrationProjectLoadMore={handleLoadMoreProjects}
        onMigrationProjectSearchChange={handleProjectSearchChange}
        noResultsLabel={t('dashboard.workspace.projectNoResults')}
        placeholder={t('project.management.removal.migrationPlaceholder')}
        searchLabel={t('project.management.searchLabel')}
        searchPlaceholder={t('project.management.searchPlaceholder')}
        selectedMigrationProjectLabel={migrationProjectLabel}
        title={t('project.management.removal.dialogTitle')}
      />
    </>
  );
}
