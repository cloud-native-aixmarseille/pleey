import type { FormEvent } from 'react';
import { OrganizationRole } from '../../../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../../../domains/organization/entities/organization-member';
import { Button } from '../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { EmptyState, LoadingState } from '../../../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { Select } from '../../../../../shared/ui/forms/select';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
import { SectionCard } from '../../../../../shared/ui/layout/section-card';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import {
  PaginationBar,
  type PaginationViewModel,
} from '../../../../shared/components/pagination-bar';

interface OrganizationMemberFormState {
  readonly role: OrganizationRole;
  readonly usernameOrEmail: string;
}

interface OrganizationMembersSectionProps {
  readonly addButtonLabel: string;
  readonly addDisabled: boolean;
  readonly addForm: OrganizationMemberFormState;
  readonly canManageMembers: boolean;
  readonly emptyLabel: string;
  readonly errorMessage: string | null;
  readonly isAddingMember: boolean;
  readonly isLoading: boolean;
  readonly members: readonly OrganizationMember[];
  readonly onAddFormChange: (patch: Partial<OrganizationMemberFormState>) => void;
  readonly onAddMember: () => void;
  readonly onMemberSearchChange: (value: string) => void;
  readonly onRemoveMember: (member: OrganizationMember) => void;
  readonly onUpdateMemberRole: (member: OrganizationMember, role: OrganizationRole) => void;
  readonly pendingRoleUpdateMemberId: OrganizationMember['id'] | null;
  readonly pendingRemovalMemberId: OrganizationMember['id'] | null;
  readonly pagination: PaginationViewModel;
  readonly roleLabel: string;
  readonly roleLabels: Record<OrganizationRole, string>;
  readonly searchDisabled: boolean;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly searchValue: string;
  readonly selectedOrganizationRole: OrganizationRole | null;
  readonly selectedOrganizationName: string | null;
  readonly title: string;
  readonly usernameOrEmailLabel: string;
  readonly usernameOrEmailPlaceholder: string;
  readonly removeButtonLabel: string;
}

const NON_OWNER_ROLES = [OrganizationRole.MANAGER, OrganizationRole.MEMBER] as const;

function getAssignableRoles(
  selectedOrganizationRole: OrganizationRole | null,
): readonly OrganizationRole[] {
  return selectedOrganizationRole === OrganizationRole.OWNER
    ? Object.values(OrganizationRole)
    : NON_OWNER_ROLES;
}

export function OrganizationMembersSection({
  addButtonLabel,
  addDisabled,
  addForm,
  canManageMembers,
  emptyLabel,
  errorMessage,
  isAddingMember,
  isLoading,
  members,
  onAddFormChange,
  onAddMember,
  onMemberSearchChange,
  onRemoveMember,
  onUpdateMemberRole,
  pendingRoleUpdateMemberId,
  pendingRemovalMemberId,
  pagination,
  roleLabel,
  roleLabels,
  searchDisabled,
  searchLabel,
  searchPlaceholder,
  searchValue,
  selectedOrganizationRole,
  selectedOrganizationName,
  title,
  usernameOrEmailLabel,
  usernameOrEmailPlaceholder,
  removeButtonLabel,
}: OrganizationMembersSectionProps) {
  const assignableRoles = getAssignableRoles(selectedOrganizationRole);
  const canManageMember = (member: OrganizationMember) =>
    canManageMembers &&
    (selectedOrganizationRole === OrganizationRole.OWNER || member.role !== OrganizationRole.OWNER);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAddMember();
  }

  return (
    <SectionCard title={title}>
      <ContentStack gap="md">
        <StatusBanner tone="error">{errorMessage}</StatusBanner>

        {canManageMembers && selectedOrganizationName ? (
          <form onSubmit={handleSubmit}>
            <SplitWrapRow align="center" gap="sm">
              <FieldShell
                id="organization-member-username-or-email"
                label={usernameOrEmailLabel}
                required
              >
                <Input
                  id="organization-member-username-or-email"
                  onChange={(event) => onAddFormChange({ usernameOrEmail: event.target.value })}
                  placeholder={usernameOrEmailPlaceholder}
                  type="text"
                  value={addForm.usernameOrEmail}
                />
              </FieldShell>

              <FieldShell id="organization-member-role" label={roleLabel} required>
                <Select
                  id="organization-member-role"
                  onChange={(event) =>
                    onAddFormChange({ role: event.target.value as OrganizationRole })
                  }
                  value={addForm.role}
                >
                  {assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </Select>
              </FieldShell>

              <Button
                disabled={addDisabled || isAddingMember}
                intent="primary"
                leftSection={<AppIcon name="plus" size={14} />}
                type="submit"
              >
                {addButtonLabel}
              </Button>
            </SplitWrapRow>
          </form>
        ) : null}

        <div aria-label={searchLabel} role="search">
          <Input
            aria-label={searchLabel}
            compact
            disabled={searchDisabled}
            onChange={(event) => onMemberSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={searchValue}
          />
        </div>

        {isLoading ? (
          <LoadingState>{title}</LoadingState>
        ) : members.length === 0 ? (
          <EmptyState>{emptyLabel}</EmptyState>
        ) : (
          <ContentStack gap="sm">
            {members.map((member) => (
              <SplitWrapRow align="center" gap="sm" key={member.id}>
                <ContentStack gap="xs">
                  <SupportingText>{member.username}</SupportingText>
                  <WrapRow gap="xs">
                    {canManageMember(member) ? (
                      <FieldShell id={`organization-member-role-${member.id}`} label={roleLabel}>
                        <Select
                          id={`organization-member-role-${member.id}`}
                          disabled={
                            pendingRoleUpdateMemberId === member.id ||
                            pendingRemovalMemberId === member.id
                          }
                          onChange={(event) =>
                            onUpdateMemberRole(member, event.target.value as OrganizationRole)
                          }
                          value={member.role}
                        >
                          {assignableRoles.map((role) => (
                            <option key={role} value={role}>
                              {roleLabels[role]}
                            </option>
                          ))}
                        </Select>
                      </FieldShell>
                    ) : (
                      <Badge tone={member.role === OrganizationRole.OWNER ? 'accent' : 'neutral'}>
                        {roleLabels[member.role]}
                      </Badge>
                    )}
                  </WrapRow>
                </ContentStack>

                {canManageMember(member) ? (
                  <Button
                    disabled={
                      pendingRemovalMemberId === member.id ||
                      pendingRoleUpdateMemberId === member.id
                    }
                    intent="ghost"
                    onClick={() => onRemoveMember(member)}
                    size="sm"
                    type="button"
                  >
                    {removeButtonLabel}
                  </Button>
                ) : null}
              </SplitWrapRow>
            ))}

            <PaginationBar {...pagination} />
          </ContentStack>
        )}
      </ContentStack>
    </SectionCard>
  );
}
