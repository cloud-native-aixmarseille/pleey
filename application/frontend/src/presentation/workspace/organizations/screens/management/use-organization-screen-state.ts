import { useEffect, useRef } from 'react';
import type { Organization } from '../../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../../domains/organization/entities/organization-member';
import type {
  AddOrganizationMemberCommand,
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
import { usePresentationFeedbackChannel } from '../../../../shared/ui/feedback/use-presentation-feedback-channel';
import {
  type DashboardWorkspaceSelectionGateway,
  useDashboardWorkspace,
} from '../../../dashboard/hooks/use-dashboard-workspace';
import { useOrganizationMemberActions } from './use-organization-member-actions';
import { useOrganizationProjectActions } from './use-organization-project-actions';

interface OrganizationScreenStateParams {
  readonly dashboardWorkspace: DashboardWorkspaceSelectionGateway;
  readonly createProject: (command: CreateProjectCommand) => Promise<Project>;
  readonly updateProject: (command: UpdateProjectCommand) => Promise<Project>;
  readonly deleteProject: (command: DeleteProjectCommand) => Promise<void>;
  readonly listOrganizationMembers: (
    query: ListOrganizationMembersQuery,
  ) => Promise<PaginatedResult<OrganizationMember>>;
  readonly addOrganizationMember: (command: AddOrganizationMemberCommand) => Promise<OrganizationMember>;
  readonly removeOrganizationMember: (member: OrganizationMember) => Promise<void>;
  readonly updateOrganizationMemberRole: (command: UpdateOrganizationMemberRoleCommand) => Promise<OrganizationMember>;
}

export function useOrganizationScreenState({ dashboardWorkspace, ...actions }: OrganizationScreenStateParams) {
  const workspace = useDashboardWorkspace({ dashboardWorkspace });
  const actionFeedback = usePresentationFeedbackChannel();
  const contextVersion = useRef(0);
  useEffect(() => {
    contextVersion.current += 1;
    actionFeedback.clearError();
    return () => {
      contextVersion.current += 1;
    };
  }, [workspace.organizationId]);

  const projectActions = useOrganizationProjectActions({
    workspace,
    contextVersion,
    actionFeedback,
    createProject: actions.createProject,
    updateProject: actions.updateProject,
    deleteProject: actions.deleteProject,
  });
  const memberActions = useOrganizationMemberActions({
    workspace,
    contextVersion,
    listOrganizationMembers: actions.listOrganizationMembers,
    addOrganizationMember: actions.addOrganizationMember,
    removeOrganizationMember: actions.removeOrganizationMember,
    updateOrganizationMemberRole: actions.updateOrganizationMemberRole,
  });

  function handleOrganizationCreated(organization: Organization) {
    actionFeedback.clearError();
    dashboardWorkspace.setOrganizationSelection(organization.id);
    workspace.reloadWorkspace();
  }

  function handleOrganizationUpdated(organization: Organization) {
    actionFeedback.clearError();
    dashboardWorkspace.setOrganizationSelection(organization.id);
    workspace.reloadWorkspace();
  }

  return {
    ...workspace,
    ...projectActions,
    ...memberActions,
    actionErrorMessage: actionFeedback.errorMessage,
    canManageMembers: workspace.selectedOrganization?.permissions.manageMembers.allowed === true,
    handleOrganizationCreated,
    handleOrganizationUpdated,
  };
}
