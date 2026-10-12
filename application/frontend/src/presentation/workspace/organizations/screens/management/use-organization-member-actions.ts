import { type RefObject, useEffect, useState } from 'react';
import { OrganizationRole } from '../../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../../domains/organization/entities/organization-member';
import type {
  AddOrganizationMemberCommand,
  ListOrganizationMembersQuery,
  UpdateOrganizationMemberRoleCommand,
} from '../../../../../domains/organization/ports/organization-repository';
import type { PaginatedResult } from '../../../../../domains/shared/value-objects/paginated-result';
import { usePresentationFeedbackChannel } from '../../../../shared/ui/feedback/use-presentation-feedback-channel';
import type { useDashboardWorkspace } from '../../../dashboard/hooks/use-dashboard-workspace';
import { useOrganizationMemberList } from './use-organization-member-list';

interface OrganizationMemberActionsParams {
  readonly workspace: ReturnType<typeof useDashboardWorkspace>;
  readonly contextVersion: RefObject<number>;
  readonly listOrganizationMembers: (
    query: ListOrganizationMembersQuery,
  ) => Promise<PaginatedResult<OrganizationMember>>;
  readonly addOrganizationMember: (command: AddOrganizationMemberCommand) => Promise<OrganizationMember>;
  readonly removeOrganizationMember: (member: OrganizationMember) => Promise<void>;
  readonly updateOrganizationMemberRole: (command: UpdateOrganizationMemberRoleCommand) => Promise<OrganizationMember>;
}

interface MemberFormValues {
  readonly role: OrganizationRole;
  readonly usernameOrEmail: string;
}

const defaultMemberForm: MemberFormValues = {
  role: OrganizationRole.MEMBER,
  usernameOrEmail: '',
};

export function useOrganizationMemberActions({
  workspace,
  contextVersion,
  listOrganizationMembers,
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
}: OrganizationMemberActionsParams) {
  const memberFeedback = usePresentationFeedbackChannel();
  const memberList = useOrganizationMemberList({
    organizationId: workspace.organizationId,
    selectedOrganization: workspace.selectedOrganization,
    listOrganizationMembers,
    memberFeedback,
  });
  const [memberForm, setMemberForm] = useState(defaultMemberForm);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberPendingRemoval, setMemberPendingRemoval] = useState<OrganizationMember | null>(null);
  const [pendingRoleUpdateMemberId, setPendingRoleUpdateMemberId] = useState<OrganizationMember['id'] | null>(null);
  const [pendingRemovalMemberId, setPendingRemovalMemberId] = useState<OrganizationMember['id'] | null>(null);

  useEffect(() => {
    setMemberForm(defaultMemberForm);
    setMemberPendingRemoval(null);
    setIsAddingMember(false);
    setPendingRemovalMemberId(null);
    setPendingRoleUpdateMemberId(null);
  }, [workspace.organizationId]);

  async function handleAddOrganizationMember() {
    if (!workspace.selectedOrganization || isAddingMember) {
      return;
    }

    const usernameOrEmail = memberForm.usernameOrEmail.trim();
    if (usernameOrEmail.length === 0) {
      memberFeedback.setErrorMessage('organization.management.members.validation.usernameOrEmailRequired');
      return;
    }

    setIsAddingMember(true);
    memberFeedback.clearError();

    const requestVersion = contextVersion.current;
    try {
      await addOrganizationMember({
        organizationId: workspace.selectedOrganization.id,
        role: memberForm.role,
        usernameOrEmail,
      });
      if (requestVersion !== contextVersion.current) return;
      setMemberForm(defaultMemberForm);
      workspace.reloadWorkspace();
    } catch (error) {
      if (requestVersion !== contextVersion.current) return;
      workspace.reloadWorkspace();
      memberFeedback.handleError(error, {
        fallbackMessage: 'organization.errors.memberAddFailed',
      });
    } finally {
      if (requestVersion === contextVersion.current) {
        setIsAddingMember(false);
      }
    }
  }

  async function handleConfirmOrganizationMemberRemoval() {
    if (!memberPendingRemoval || pendingRemovalMemberId !== null || pendingRoleUpdateMemberId !== null) {
      return;
    }

    setPendingRemovalMemberId(memberPendingRemoval.id);
    memberFeedback.clearError();

    const requestVersion = contextVersion.current;
    try {
      await removeOrganizationMember(memberPendingRemoval);
      if (requestVersion !== contextVersion.current) return;
      setMemberPendingRemoval(null);
      workspace.reloadWorkspace();
    } catch (error) {
      if (requestVersion !== contextVersion.current) return;
      workspace.reloadWorkspace();
      memberFeedback.handleError(error, {
        fallbackMessage: 'organization.errors.memberRemoveFailed',
      });
    } finally {
      if (requestVersion === contextVersion.current) {
        setPendingRemovalMemberId(null);
      }
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

  async function handleUpdateOrganizationMemberRole(member: OrganizationMember, role: OrganizationRole) {
    if (pendingRoleUpdateMemberId !== null || pendingRemovalMemberId !== null) {
      return;
    }

    setPendingRoleUpdateMemberId(member.id);
    memberFeedback.clearError();

    const requestVersion = contextVersion.current;
    try {
      const updatedMember = await updateOrganizationMemberRole({
        memberId: member.id,
        role,
      });
      if (requestVersion !== contextVersion.current) return;
      memberList.updateMember(updatedMember);
      workspace.reloadWorkspace();
    } catch (error) {
      if (requestVersion !== contextVersion.current) return;
      workspace.reloadWorkspace();
      memberFeedback.handleError(error, {
        fallbackMessage: 'organization.errors.memberRoleUpdateFailed',
      });
    } finally {
      if (requestVersion === contextVersion.current) {
        setPendingRoleUpdateMemberId(null);
      }
    }
  }

  function handleMemberFormChange(patch: Partial<MemberFormValues>) {
    setMemberForm((current) => ({ ...current, ...patch }));
  }

  return {
    ...memberList,
    memberErrorMessage: memberFeedback.errorMessage,
    memberForm,
    isAddingMember,
    memberPendingRemoval,
    pendingRoleUpdateMemberId,
    pendingRemovalMemberId,
    handleAddOrganizationMember,
    handleConfirmOrganizationMemberRemoval,
    openRemoveOrganizationMemberDialog,
    cancelOrganizationMemberRemoval,
    handleUpdateOrganizationMemberRole,
    handleMemberFormChange,
  };
}
