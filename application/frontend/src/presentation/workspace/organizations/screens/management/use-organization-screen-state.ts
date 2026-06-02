import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Organization,
  OrganizationId,
} from '../../../../../domains/organization/entities/organization';
import { OrganizationRole } from '../../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../../domains/organization/entities/organization-member';
import type {
  AddOrganizationMemberCommand,
  UpdateOrganizationMemberRoleCommand,
} from '../../../../../domains/organization/ports/organization-repository';
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
  readonly listOrganizationMembers: (
    organizationId: OrganizationId,
  ) => Promise<OrganizationMember[]>;
  readonly addOrganizationMember: (
    command: AddOrganizationMemberCommand,
  ) => Promise<OrganizationMember>;
  readonly removeOrganizationMember: (member: OrganizationMember) => Promise<void>;
  readonly updateOrganizationMemberRole: (
    command: UpdateOrganizationMemberRoleCommand,
  ) => Promise<OrganizationMember>;
}

interface ProjectFormValues {
  readonly name: string;
  readonly description: string | null;
}

interface MemberFormValues {
  readonly role: OrganizationRole;
  readonly usernameOrEmail: string;
}

const defaultMemberForm: MemberFormValues = {
  role: OrganizationRole.MEMBER,
  usernameOrEmail: '',
};

function canManageMembers(organization: Organization | null): boolean {
  return (
    organization?.role === OrganizationRole.OWNER || organization?.role === OrganizationRole.MANAGER
  );
}

export function useOrganizationScreenState({
  dashboardWorkspace,
  createProject,
  updateProject,
  deleteProject,
  listOrganizationMembers,
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
}: OrganizationScreenStateParams) {
  const [reloadKey, setReloadKey] = useState(0);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectPendingRemoval, setProjectPendingRemoval] = useState<Project | null>(null);
  const [migrationProjectId, setMigrationProjectId] = useState<ProjectId | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [memberForm, setMemberForm] = useState(defaultMemberForm);
  const [memberErrorMessage, setMemberErrorMessage] = useState<string | null>(null);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberPendingRemoval, setMemberPendingRemoval] = useState<OrganizationMember | null>(null);
  const [pendingRoleUpdateMemberId, setPendingRoleUpdateMemberId] = useState<
    OrganizationMember['id'] | null
  >(null);
  const [pendingRemovalMemberId, setPendingRemovalMemberId] = useState<
    OrganizationMember['id'] | null
  >(null);

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

  useEffect(() => {
    const selectedOrganization = workspace.selectedOrganization;

    if (!selectedOrganization) {
      setOrganizationMembers([]);
      setMemberErrorMessage(null);
      return;
    }

    let ignore = false;

    const loadMembers = async () => {
      setIsMembersLoading(true);
      setMemberErrorMessage(null);

      try {
        const members = await listOrganizationMembers(selectedOrganization.id);

        if (!ignore) {
          setOrganizationMembers(members);
        }
      } catch (error) {
        if (!ignore) {
          setOrganizationMembers([]);
          setMemberErrorMessage(
            error instanceof Error ? error.message : 'organization.errors.loadFailed',
          );
        }
      } finally {
        if (!ignore) {
          setIsMembersLoading(false);
        }
      }
    };

    void loadMembers();

    return () => {
      ignore = true;
    };
  }, [listOrganizationMembers, workspace.selectedOrganization]);

  const availableMigrationProjects = projectPendingRemoval
    ? workspace.projects.filter((project) => project.id !== projectPendingRemoval.id)
    : [];

  function handleOrganizationCreated(organization: Organization) {
    setActionErrorMessage(null);
    dashboardWorkspace.setOrganizationSelection(organization.id);
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

  async function handleAddOrganizationMember() {
    if (!workspace.selectedOrganization || isAddingMember) {
      return;
    }

    const usernameOrEmail = memberForm.usernameOrEmail.trim();
    if (usernameOrEmail.length === 0) {
      setMemberErrorMessage('organization.management.members.validation.usernameOrEmailRequired');
      return;
    }

    setIsAddingMember(true);
    setMemberErrorMessage(null);

    try {
      const member = await addOrganizationMember({
        organizationId: workspace.selectedOrganization.id,
        role: memberForm.role,
        usernameOrEmail,
      });
      setOrganizationMembers((members) => [...members, member]);
      setMemberForm(defaultMemberForm);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setMemberErrorMessage(
        error instanceof Error ? error.message : 'organization.errors.memberAddFailed',
      );
    } finally {
      setIsAddingMember(false);
    }
  }

  async function handleConfirmOrganizationMemberRemoval() {
    if (
      !memberPendingRemoval ||
      pendingRemovalMemberId !== null ||
      pendingRoleUpdateMemberId !== null
    ) {
      return;
    }

    setPendingRemovalMemberId(memberPendingRemoval.id);
    setMemberErrorMessage(null);

    try {
      await removeOrganizationMember(memberPendingRemoval);
      setOrganizationMembers((members) =>
        members.filter((current) => current.id !== memberPendingRemoval.id),
      );
      setMemberPendingRemoval(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setMemberErrorMessage(
        error instanceof Error ? error.message : 'organization.errors.memberRemoveFailed',
      );
    } finally {
      setPendingRemovalMemberId(null);
    }
  }

  function openRemoveOrganizationMemberDialog(member: OrganizationMember) {
    if (pendingRemovalMemberId !== null || pendingRoleUpdateMemberId !== null) {
      return;
    }

    setMemberErrorMessage(null);
    setMemberPendingRemoval(member);
  }

  function cancelOrganizationMemberRemoval() {
    if (pendingRemovalMemberId !== null) {
      return;
    }

    setMemberPendingRemoval(null);
  }

  async function handleUpdateOrganizationMemberRole(
    member: OrganizationMember,
    role: OrganizationRole,
  ) {
    if (pendingRoleUpdateMemberId !== null || pendingRemovalMemberId !== null) {
      return;
    }

    setPendingRoleUpdateMemberId(member.id);
    setMemberErrorMessage(null);

    try {
      const updatedMember = await updateOrganizationMemberRole({
        memberId: member.id,
        role,
      });
      setOrganizationMembers((members) =>
        members.map((current) => (current.id === updatedMember.id ? updatedMember : current)),
      );
      setReloadKey((key) => key + 1);
    } catch (error) {
      setMemberErrorMessage(
        error instanceof Error ? error.message : 'organization.errors.memberRoleUpdateFailed',
      );
    } finally {
      setPendingRoleUpdateMemberId(null);
    }
  }

  function handleMemberFormChange(patch: Partial<MemberFormValues>) {
    setMemberForm((current) => ({ ...current, ...patch }));
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
    cancelOrganizationMemberRemoval,
    editingProject,
    handleConfirmOrganizationMemberRemoval,
    handleConfirmProjectRemoval,
    handleAddOrganizationMember,
    handleCreateProject,
    handleOrganizationCreated,
    handleMemberFormChange,
    handleProjectMutationCompleted,
    handleUpdateOrganizationMemberRole,
    handleUpdateProject,
    canManageMembers: canManageMembers(workspace.selectedOrganization),
    isCreateProjectOpen,
    isAddingMember,
    isDeletingProject,
    isMembersLoading,
    memberErrorMessage,
    memberForm,
    memberPendingRemoval,
    migrationProjectId,
    organizationMembers,
    openRemoveOrganizationMemberDialog,
    pendingRoleUpdateMemberId,
    pendingRemovalMemberId,
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
