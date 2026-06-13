import { useDebouncedValue } from '@mantine/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Organization,
  OrganizationId,
} from '../../../../../domains/organization/entities/organization';
import { OrganizationRole } from '../../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../../domains/organization/entities/organization-member';
import type {
  AddOrganizationMemberCommand,
  ListOrganizationMembersQuery,
  UpdateOrganizationMemberRoleCommand,
} from '../../../../../domains/organization/ports/organization-repository';
import type { Project, ProjectId } from '../../../../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  UpdateProjectCommand,
} from '../../../../../domains/project/ports/project-repository';
import type { PaginatedResult } from '../../../../../domains/shared/value-objects/paginated-result';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { usePresentationFeedbackChannel } from '../../../../shared/ui/feedback/use-presentation-feedback-channel';
import {
  type DashboardWorkspaceSelectionGateway,
  useDashboardWorkspace,
} from '../../../dashboard/hooks/use-dashboard-workspace';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;

interface OrganizationScreenStateParams {
  readonly dashboardWorkspace: DashboardWorkspaceSelectionGateway;
  readonly createProject: (command: CreateProjectCommand) => Promise<Project>;
  readonly updateProject: (command: UpdateProjectCommand) => Promise<Project>;
  readonly deleteProject: (command: DeleteProjectCommand) => Promise<void>;
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

function normalizeSearchTerm(search: string): string | undefined {
  const normalizedSearch = search.trim();

  return normalizedSearch.length > 0 ? normalizedSearch : undefined;
}

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
  const { t } = usePresentationTranslation();
  const actionFeedback = usePresentationFeedbackChannel();
  const memberFeedback = usePresentationFeedbackChannel();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectPendingRemoval, setProjectPendingRemoval] = useState<Project | null>(null);
  const [migrationProjectId, setMigrationProjectId] = useState<ProjectId | null>(null);
  const [migrationProjectLabel, setMigrationProjectLabel] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [memberPage, setMemberPage] = useState(DEFAULT_PAGE);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberForm, setMemberForm] = useState(defaultMemberForm);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberPendingRemoval, setMemberPendingRemoval] = useState<OrganizationMember | null>(null);
  const [pendingRoleUpdateMemberId, setPendingRoleUpdateMemberId] = useState<
    OrganizationMember['id'] | null
  >(null);
  const [pendingRemovalMemberId, setPendingRemovalMemberId] = useState<
    OrganizationMember['id'] | null
  >(null);
  const [debouncedMemberSearch] = useDebouncedValue(memberSearch, 200);
  const isMemberSearchPending =
    normalizeSearchTerm(memberSearch) !== normalizeSearchTerm(debouncedMemberSearch);

  const stableDashboardWorkspace = useCallback<
    DashboardWorkspaceSelectionGateway['restoreOrganizationSelection']
  >((query) => dashboardWorkspace.restoreOrganizationSelection(query), [dashboardWorkspace]);

  const stableOrganizationWorkspace = useCallback<
    DashboardWorkspaceSelectionGateway['loadOrganizationWorkspaceState']
  >((query) => dashboardWorkspace.loadOrganizationWorkspaceState(query), [dashboardWorkspace]);

  const stableOrganizationsPage = useCallback<
    DashboardWorkspaceSelectionGateway['loadOrganizationsPage']
  >((query) => dashboardWorkspace.loadOrganizationsPage(query), [dashboardWorkspace]);

  const stableOrganizationProjectsPage = useCallback<
    DashboardWorkspaceSelectionGateway['loadOrganizationProjectsPage']
  >((query) => dashboardWorkspace.loadOrganizationProjectsPage(query), [dashboardWorkspace]);

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
      loadOrganizationsPage: stableOrganizationsPage,
      loadOrganizationProjectsPage: stableOrganizationProjectsPage,
      restoreOrganizationSelection: stableDashboardWorkspace,
      loadOrganizationWorkspaceState: stableOrganizationWorkspace,
      setOrganizationSelection: stableSetOrganizationSelection,
      setProjectSelection: stableSetProjectSelection,
    }),
    [
      stableOrganizationsPage,
      stableOrganizationProjectsPage,
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
      setMemberTotalPages(1);
      memberFeedback.clearError();
      return;
    }

    if (isMemberSearchPending) {
      return;
    }

    let ignore = false;

    const loadMembers = async () => {
      setIsMembersLoading(true);
      memberFeedback.clearError();

      try {
        const members = await listOrganizationMembers({
          organizationId: selectedOrganization.id,
          page: memberPage,
          pageSize: DEFAULT_PAGE_SIZE,
          search: normalizeSearchTerm(debouncedMemberSearch),
        });

        if (!ignore) {
          setOrganizationMembers([...members.items]);
          setMemberTotalPages(members.totalPages);
        }
      } catch (error) {
        if (!ignore) {
          setOrganizationMembers([]);
          setMemberTotalPages(1);
          memberFeedback.handleError(error, {
            fallbackMessage: 'organization.errors.loadFailed',
          });
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
  }, [
    debouncedMemberSearch,
    isMemberSearchPending,
    listOrganizationMembers,
    memberPage,
    workspace.selectedOrganization,
  ]);

  useEffect(() => {
    setMemberPage(DEFAULT_PAGE);
    setMemberSearch('');
  }, []);

  const availableMigrationProjects = projectPendingRemoval
    ? workspace.projects.filter((project) => project.id !== projectPendingRemoval.id)
    : [];

  function handleOrganizationCreated(organization: Organization) {
    actionFeedback.clearError();
    dashboardWorkspace.setOrganizationSelection(organization.id);
    workspace.reloadWorkspace();
  }

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
    actionFeedback.clearError();

    try {
      await deleteProject({
        projectId: projectPendingRemoval.id,
        migrationProjectId,
      });
      setProjectPendingRemoval(null);
      setMigrationProjectId(null);
      setMigrationProjectLabel(null);
      workspace.reloadWorkspace();
    } catch (error) {
      actionFeedback.handleError(error, {
        fallbackMessage: 'project.errors.deleteFailed',
      });
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
      memberFeedback.setErrorMessage(
        'organization.management.members.validation.usernameOrEmailRequired',
      );
      return;
    }

    setIsAddingMember(true);
    memberFeedback.clearError();

    try {
      await addOrganizationMember({
        organizationId: workspace.selectedOrganization.id,
        role: memberForm.role,
        usernameOrEmail,
      });
      setMemberForm(defaultMemberForm);
      workspace.reloadWorkspace();
    } catch (error) {
      memberFeedback.handleError(error, {
        fallbackMessage: 'organization.errors.memberAddFailed',
      });
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
    memberFeedback.clearError();

    try {
      await removeOrganizationMember(memberPendingRemoval);
      setMemberPendingRemoval(null);
      workspace.reloadWorkspace();
    } catch (error) {
      memberFeedback.handleError(error, {
        fallbackMessage: 'organization.errors.memberRemoveFailed',
      });
    } finally {
      setPendingRemovalMemberId(null);
    }
  }

  function openRemoveOrganizationMemberDialog(member: OrganizationMember) {
    if (pendingRemovalMemberId !== null || pendingRoleUpdateMemberId !== null) {
      return;
    }

    memberFeedback.clearError();
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
    memberFeedback.clearError();

    try {
      const updatedMember = await updateOrganizationMemberRole({
        memberId: member.id,
        role,
      });
      setOrganizationMembers((members) =>
        members.map((current) => (current.id === updatedMember.id ? updatedMember : current)),
      );
      workspace.reloadWorkspace();
    } catch (error) {
      memberFeedback.handleError(error, {
        fallbackMessage: 'organization.errors.memberRoleUpdateFailed',
      });
    } finally {
      setPendingRoleUpdateMemberId(null);
    }
  }

  function handleMemberFormChange(patch: Partial<MemberFormValues>) {
    setMemberForm((current) => ({ ...current, ...patch }));
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
    if (workspace.projectTotalCount <= 1) {
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

  function handleMemberPageChange(page: number) {
    setMemberPage(page);
  }

  function handleMemberSearchChange(value: string) {
    setMemberSearch(value);
    setMemberPage(DEFAULT_PAGE);
  }

  return {
    ...workspace,
    actionErrorMessage: actionFeedback.errorMessage,
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
    memberErrorMessage: memberFeedback.errorMessage,
    memberForm,
    memberPage,
    memberSearch,
    memberTotalPages,
    memberPendingRemoval,
    migrationProjectLabel,
    migrationProjectId,
    organizationMembers,
    handleMemberPageChange,
    handleMemberSearchChange,
    handleMigrationProjectChange,
    openRemoveOrganizationMemberDialog,
    pendingRoleUpdateMemberId,
    pendingRemovalMemberId,
    projectPendingRemoval,
    cancelProjectRemoval,
    closeCreateProjectDialog,
    closeEditProjectDialog,
    openCreateProjectDialog,
    openEditProjectDialog,
    openRemoveProjectDialog,
  };
}
