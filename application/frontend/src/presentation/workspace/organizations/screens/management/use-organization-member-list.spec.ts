import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { OrganizationMember } from '../../../../../domains/organization/entities/organization-member';
import type { PaginatedResult } from '../../../../../domains/shared/value-objects/paginated-result';
import { OrganizationFixtureFactory } from '../../../../../test-utils/fixtures/organization-fixture-factory';
import { OrganizationScreenFixtureFactory } from '../../../../../test-utils/fixtures/organization-screen-fixture-factory';
import { usePresentationFeedbackChannel } from '../../../../shared/ui/feedback/use-presentation-feedback-channel';
import { useOrganizationMemberList } from './use-organization-member-list';

const organizations = new OrganizationFixtureFactory();
const fixtures = new OrganizationScreenFixtureFactory();

describe('useOrganizationMemberList', () => {
  it('discards a previous organization response after the selection changes', async () => {
    // Arrange
    const first = organizations.createOrganization({ id: 1 });
    const second = organizations.createOrganization({ id: 2 });
    const oldMember = fixtures.createOrganizationMember({ organizationId: first.id, username: 'old-member' });
    const newMember = fixtures.createOrganizationMember({ organizationId: second.id, username: 'new-member' });
    let resolveMembers!: (page: PaginatedResult<OrganizationMember>) => void;
    const pending = new Promise<PaginatedResult<OrganizationMember>>((resolve) => {
      resolveMembers = resolve;
    });
    const nextPage: PaginatedResult<OrganizationMember> = {
      items: [newMember],
      totalCount: 1,
      overallCount: 1,
      page: 1,
      pageSize: 25,
      totalPages: 1,
    };
    const listOrganizationMembers = vi.fn().mockReturnValueOnce(pending).mockResolvedValue(nextPage);
    const { result, rerender } = renderHook(
      ({ selectedOrganization }) =>
        useOrganizationMemberList({
          organizationId: selectedOrganization.id,
          selectedOrganization,
          listOrganizationMembers,
          memberFeedback: usePresentationFeedbackChannel(),
        }),
      { initialProps: { selectedOrganization: first } },
    );
    // Act
    rerender({ selectedOrganization: second });
    await act(async () => {
      resolveMembers({ ...nextPage, items: [oldMember] });
    });
    // Assert
    await waitFor(() => expect(result.current.organizationMembers).toEqual([newMember]));
    expect(result.current.isMembersLoading).toBe(false);
  });

  it('clears member state and loading when the organization is removed during a request', async () => {
    // Arrange
    const organization = organizations.createOrganization();
    let resolveMembers!: (page: PaginatedResult<OrganizationMember>) => void;
    const pending = new Promise<PaginatedResult<OrganizationMember>>((resolve) => {
      resolveMembers = resolve;
    });
    const listOrganizationMembers = vi.fn().mockReturnValue(pending);
    const { result, rerender } = renderHook(
      ({ organizationId }) =>
        useOrganizationMemberList({
          organizationId,
          selectedOrganization: organization,
          listOrganizationMembers,
          memberFeedback: usePresentationFeedbackChannel(),
        }),
      { initialProps: { organizationId: organization.id as typeof organization.id | null } },
    );
    // Act
    rerender({ organizationId: null });
    await act(async () => {
      resolveMembers({
        items: [fixtures.createOrganizationMember()],
        totalCount: 1,
        overallCount: 1,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      });
    });
    // Assert
    expect(result.current.organizationMembers).toEqual([]);
    expect(result.current.isMembersLoading).toBe(false);
    expect(result.current.memberPage).toBe(1);
  });
});
