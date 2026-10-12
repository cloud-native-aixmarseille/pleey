import { useEffect, useState } from 'react';
import type { Organization, OrganizationId } from '../../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../../domains/organization/entities/organization-member';
import type { ListOrganizationMembersQuery } from '../../../../../domains/organization/ports/organization-repository';
import type { PaginatedResult } from '../../../../../domains/shared/value-objects/paginated-result';
import { usePresentationDebouncedValue } from '../../../../shared/hooks/use-presentation-debounced-value';
import type { usePresentationFeedbackChannel } from '../../../../shared/ui/feedback/use-presentation-feedback-channel';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;

interface OrganizationMemberListParams {
  readonly organizationId: OrganizationId | null;
  readonly selectedOrganization: Organization | null;
  readonly listOrganizationMembers: (
    query: ListOrganizationMembersQuery,
  ) => Promise<PaginatedResult<OrganizationMember>>;
  readonly memberFeedback: ReturnType<typeof usePresentationFeedbackChannel>;
}

function normalizeSearchTerm(search: string): string | undefined {
  const normalizedSearch = search.trim();

  return normalizedSearch.length > 0 ? normalizedSearch : undefined;
}

export function useOrganizationMemberList({
  organizationId,
  selectedOrganization,
  listOrganizationMembers,
  memberFeedback,
}: OrganizationMemberListParams) {
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [memberPage, setMemberPage] = useState(DEFAULT_PAGE);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [memberSearch, setMemberSearch] = useState('');
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [debouncedMemberSearch] = usePresentationDebouncedValue(memberSearch);
  const isMemberSearchPending = normalizeSearchTerm(memberSearch) !== normalizeSearchTerm(debouncedMemberSearch);

  useEffect(() => {
    if (!selectedOrganization || selectedOrganization.id !== organizationId) {
      setIsMembersLoading(false);
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
    selectedOrganization,
    organizationId,
  ]);

  useEffect(() => {
    setMemberPage(DEFAULT_PAGE);
    setMemberSearch('');
    setOrganizationMembers([]);
  }, [organizationId]);

  function handleMemberPageChange(page: number) {
    setMemberPage(page);
  }

  function handleMemberSearchChange(value: string) {
    setMemberSearch(value);
    setMemberPage(DEFAULT_PAGE);
  }

  function updateMember(updatedMember: OrganizationMember) {
    setOrganizationMembers((members) =>
      members.map((current) => (current.id === updatedMember.id ? updatedMember : current)),
    );
  }

  return {
    organizationMembers,
    memberPage,
    memberSearch,
    memberTotalPages,
    isMembersLoading,
    handleMemberPageChange,
    handleMemberSearchChange,
    updateMember,
  };
}
