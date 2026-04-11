import { useCallback, useMemo, useState } from 'react';
import type {
  Organization,
  OrganizationId,
} from '../../../../../domains/organization/entities/organization';
import type { Project, ProjectId } from '../../../../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  UpdateProjectCommand,
} from '../../../../../domains/project/ports/project-repository';
import {
  type DashboardWorkspaceSelectionGateway,
  useDashboardWorkspace,
} from '../../../dashboard/hooks/use-dashboard-workspace';

interface OrganizationScreenStateParams {
  readonly dashboardWorkspace: DashboardWorkspaceSelectionGateway;
  readonly createProject: (command: CreateProjectCommand) => Promise<Project>;
  readonly updateProject: (command: UpdateProjectCommand) => Promise<Project>;
  readonly deleteProject: (command: DeleteProjectCommand) => Promise<void>;
}

interface ProjectFormValues {
  readonly name: string;
  readonly description: string | null;
}

export function useOrganizationScreenState({
  dashboardWorkspace,
  createProject,
  updateProject,
  deleteProject,
}: OrganizationScreenStateParams) {
  const [reloadKey, setReloadKey] = useState(0);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectPendingRemoval, setProjectPendingRemoval] = useState<Project | null>(null);
  const [migrationProjectId, setMigrationProjectId] = useState<ProjectId | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const stableDashboardWorkspace = useCallback(
    () => dashboardWorkspace.restoreOrganizationSelection(),
    [dashboardWorkspace, reloadKey],
  );

  const stableOrganizationWorkspace = useCallback(
    (organizationId: OrganizationId | null) =>
      dashboardWorkspace.loadOrganizationWorkspaceState(organizationId),
    [dashboardWorkspace, reloadKey],
  );

  const stableSetOrganizationSelection = useCallback(
    (organizationId: OrganizationId | null) =>
      dashboardWorkspace.setOrganizationSelection(organizationId),
    [dashboardWorkspace],
  );

  const stableSetProjectSelection = useCallback(
    (projectId: ProjectId | null) => dashboardWorkspace.setProjectSelection(projectId),
    [dashboardWorkspace],
  );

  const stableDashboardWorkspaceProxy = useMemo(
    () => ({
      restoreOrganizationSelection: stableDashboardWorkspace,
      loadOrganizationWorkspaceState: stableOrganizationWorkspace,
      setOrganizationSelection: stableSetOrganizationSelection,
      setProjectSelection: stableSetProjectSelection,
    }),
    [
      stableDashboardWorkspace,
      stableOrganizationWorkspace,
      stableSetOrganizationSelection,
      stableSetProjectSelection,
    ],
  );

  const workspace = useDashboardWorkspace({
    dashboardWorkspace: stableDashboardWorkspaceProxy,
  });

  const availableMigrationProjects = projectPendingRemoval
    ? workspace.projects.filter((project) => project.id !== projectPendingRemoval.id)
    : [];

  function handleOrganizationCreated(_organization: Organization) {
    setActionErrorMessage(null);
    setReloadKey((key) => key + 1);
  }

  function handleProjectMutationCompleted(_project: Project) {
    setActionErrorMessage(null);
    setIsCreateProjectOpen(false);
    setEditingProject(null);
    setReloadKey((key) => key + 1);
  }

  async function handleCreateProject(values: ProjectFormValues): Promise<Project> {
    if (!workspace.selectedOrganization) {
      throw new Error('project.errors.createFailed');
    }

    return createProject({
      organizationId: workspace.selectedOrganization.id,
      name: values.name,
      description: values.description,
    });
  }

  async function handleUpdateProject(values: ProjectFormValues): Promise<Project> {
    if (!editingProject) {
      throw new Error('project.errors.updateFailed');
    }

    return updateProject({
      projectId: editingProject.id,
      name: values.name,
      description: values.description,
    });
  }

  async function handleConfirmProjectRemoval() {
    if (!projectPendingRemoval || isDeletingProject) {
      return;
    }

    setIsDeletingProject(true);
    setActionErrorMessage(null);

    try {
      await deleteProject({
        projectId: projectPendingRemoval.id,
        migrationProjectId,
      });
      setProjectPendingRemoval(null);
      setMigrationProjectId(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setActionErrorMessage(error instanceof Error ? error.message : 'project.errors.deleteFailed');
    } finally {
      setIsDeletingProject(false);
    }
  }

  function openCreateProjectDialog() {
    setActionErrorMessage(null);
    setIsCreateProjectOpen(true);
  }

  function closeCreateProjectDialog() {
    setIsCreateProjectOpen(false);
  }

  function openEditProjectDialog(project: Project) {
    setActionErrorMessage(null);
    setEditingProject(project);
  }

  function closeEditProjectDialog() {
    setEditingProject(null);
  }

  function openRemoveProjectDialog(project: Project) {
    if (workspace.projects.length <= 1) {
      return;
    }

    setActionErrorMessage(null);
    setProjectPendingRemoval(project);
    setMigrationProjectId(null);
  }

  function cancelProjectRemoval() {
    if (isDeletingProject) {
      return;
    }

    setProjectPendingRemoval(null);
    setMigrationProjectId(null);
  }

  return {
    ...workspace,
    actionErrorMessage,
    availableMigrationProjects,
    editingProject,
    handleConfirmProjectRemoval,
    handleCreateProject,
    handleOrganizationCreated,
    handleProjectMutationCompleted,
    handleUpdateProject,
    isCreateProjectOpen,
    isDeletingProject,
    migrationProjectId,
    projectPendingRemoval,
    setMigrationProjectId,
    cancelProjectRemoval,
    closeCreateProjectDialog,
    closeEditProjectDialog,
    openCreateProjectDialog,
    openEditProjectDialog,
    openRemoveProjectDialog,
  };
}
