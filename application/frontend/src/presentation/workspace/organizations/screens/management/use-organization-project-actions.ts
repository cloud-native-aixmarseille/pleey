import { type RefObject, useEffect, useState } from 'react';
import type { PartySettings } from '../../../../../domains/game/party/shared/entities/party-settings';
import type { Project, ProjectId } from '../../../../../domains/project/entities/project';
import {
  ProjectCreateFailedError,
  ProjectUpdateFailedError,
} from '../../../../../domains/project/errors/project-error-code';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  UpdateProjectCommand,
} from '../../../../../domains/project/ports/project-repository';
import type { ThemeId } from '../../../../../domains/theme/entities/theme-id';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import type { usePresentationFeedbackChannel } from '../../../../shared/ui/feedback/use-presentation-feedback-channel';
import type { useDashboardWorkspace } from '../../../dashboard/hooks/use-dashboard-workspace';

interface OrganizationProjectActionsParams {
  readonly workspace: ReturnType<typeof useDashboardWorkspace>;
  readonly contextVersion: RefObject<number>;
  readonly actionFeedback: ReturnType<typeof usePresentationFeedbackChannel>;
  readonly createProject: (command: CreateProjectCommand) => Promise<Project>;
  readonly updateProject: (command: UpdateProjectCommand) => Promise<Project>;
  readonly deleteProject: (command: DeleteProjectCommand) => Promise<void>;
}

interface ProjectFormValues {
  readonly name: string;
  readonly description: string | null;
  readonly defaultPartySettings: PartySettings;
  readonly defaultThemeId: ThemeId | null;
}

export function useOrganizationProjectActions({
  workspace,
  contextVersion,
  actionFeedback,
  createProject,
  updateProject,
  deleteProject,
}: OrganizationProjectActionsParams) {
  const { t } = usePresentationTranslation();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectPendingRemoval, setProjectPendingRemoval] = useState<Project | null>(null);
  const [migrationProjectId, setMigrationProjectId] = useState<ProjectId | null>(null);
  const [migrationProjectLabel, setMigrationProjectLabel] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  useEffect(() => {
    setIsCreateProjectOpen(false);
    setEditingProject(null);
    setProjectPendingRemoval(null);
    setMigrationProjectId(null);
    setMigrationProjectLabel(null);
    setIsDeletingProject(false);
  }, [workspace.organizationId]);

  const availableMigrationProjects = projectPendingRemoval
    ? workspace.projects.filter((project) => project.id !== projectPendingRemoval.id)
    : [];

  function handleProjectMutationCompleted(_project: Project) {
    const isCreateMutation = editingProject === null;

    actionFeedback.clearError();
    setIsCreateProjectOpen(false);
    setEditingProject(null);

    if (isCreateMutation) {
      if (workspace.projectPage === 1) {
        workspace.reloadWorkspace();
      } else {
        workspace.handleProjectPageChange(1);
      }

      actionFeedback.notify('success', t('project.management.form.create.success'), {
        id: 'project-create-success-toast',
      });
    } else {
      workspace.reloadWorkspace();
    }
  }

  async function handleCreateProject(values: ProjectFormValues): Promise<Project> {
    if (!workspace.selectedOrganization) {
      throw new ProjectCreateFailedError({
        reason: 'missingSelectedOrganization',
      });
    }

    const version = contextVersion.current;
    try {
      return await createProject({
        organizationId: workspace.selectedOrganization.id,
        name: values.name,
        description: values.description,
        defaultPartySettings: values.defaultPartySettings,
        defaultThemeId: values.defaultThemeId,
      });
    } catch (error) {
      if (contextVersion.current === version) workspace.reloadWorkspace();
      throw error;
    }
  }

  async function handleUpdateProject(values: ProjectFormValues): Promise<Project> {
    if (!editingProject) {
      throw new ProjectUpdateFailedError({
        reason: 'missingEditingProject',
      });
    }

    const version = contextVersion.current;
    try {
      return await updateProject({
        projectId: editingProject.id,
        name: values.name,
        description: values.description,
        defaultPartySettings: values.defaultPartySettings,
        defaultThemeId: values.defaultThemeId,
      });
    } catch (error) {
      if (contextVersion.current === version) workspace.reloadWorkspace();
      throw error;
    }
  }

  async function handleConfirmProjectRemoval() {
    if (!projectPendingRemoval || isDeletingProject) {
      return;
    }

    setIsDeletingProject(true);
    actionFeedback.clearError();

    const requestVersion = contextVersion.current;
    try {
      await deleteProject({
        projectId: projectPendingRemoval.id,
        migrationProjectId,
      });
      if (requestVersion !== contextVersion.current) return;
      setProjectPendingRemoval(null);
      setMigrationProjectId(null);
      setMigrationProjectLabel(null);
      workspace.reloadWorkspace();
    } catch (error) {
      if (requestVersion !== contextVersion.current) return;
      workspace.reloadWorkspace();
      actionFeedback.handleError(error, {
        fallbackMessage: 'project.errors.deleteFailed',
      });
    } finally {
      if (requestVersion === contextVersion.current) {
        setIsDeletingProject(false);
      }
    }
  }

  function openCreateProjectDialog() {
    actionFeedback.clearError();
    setIsCreateProjectOpen(true);
  }

  function closeCreateProjectDialog() {
    setIsCreateProjectOpen(false);
  }

  function openEditProjectDialog(project: Project) {
    actionFeedback.clearError();
    setEditingProject(project);
  }

  function closeEditProjectDialog() {
    setEditingProject(null);
  }

  function openRemoveProjectDialog(project: Project) {
    if (!project.permissions.delete.allowed) {
      return;
    }

    actionFeedback.clearError();
    setProjectPendingRemoval(project);
    setMigrationProjectId(null);
    setMigrationProjectLabel(null);
  }

  function cancelProjectRemoval() {
    if (isDeletingProject) {
      return;
    }

    setProjectPendingRemoval(null);
    setMigrationProjectId(null);
    setMigrationProjectLabel(null);
  }

  function handleMigrationProjectChange(projectId: ProjectId | null) {
    setMigrationProjectId(projectId);
    setMigrationProjectLabel(
      projectId === null
        ? null
        : (availableMigrationProjects.find((project) => project.id === projectId)?.name ?? null),
    );
  }

  return {
    availableMigrationProjects,
    editingProject,
    isCreateProjectOpen,
    isDeletingProject,
    migrationProjectId,
    migrationProjectLabel,
    projectPendingRemoval,
    handleProjectMutationCompleted,
    handleCreateProject,
    handleUpdateProject,
    handleConfirmProjectRemoval,
    openCreateProjectDialog,
    closeCreateProjectDialog,
    openEditProjectDialog,
    closeEditProjectDialog,
    openRemoveProjectDialog,
    cancelProjectRemoval,
    handleMigrationProjectChange,
  };
}
