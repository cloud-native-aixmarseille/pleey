import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { RemoveMemberFromOrganizationUseCase } from './remove-member-from-organization.use-case';

describe('RemoveMemberFromOrganizationUseCase', () => {
  it('throws MEMBER_NOT_FOUND when member does not exist', async () => {
    const memberRepository = {
      findById: vi.fn().mockResolvedValue(null),
    };
    const useCase = new RemoveMemberFromOrganizationUseCase(memberRepository as never);
    await expect(useCase.execute(1, 10)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(1, 10)).rejects.toThrow(OrganizationErrorCode.MEMBER_NOT_FOUND);
  });

  it('throws when requesting user lacks admin privileges', async () => {
    const memberRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1, organizationId: 1, role: 'MEMBER' }),
      findByOrganizationAndUser: vi.fn().mockResolvedValue({ hasAdminPrivileges: () => false }),
    };
    const useCase = new RemoveMemberFromOrganizationUseCase(memberRepository as never);
    await expect(useCase.execute(1, 10)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when trying to remove the last owner', async () => {
    const ownerMember = {
      id: 1,
      organizationId: 1,
      role: OrganizationRole.OWNER,
      isOwner: () => true,
    };
    const memberRepository = {
      findById: vi.fn().mockResolvedValue(ownerMember),
      findByOrganizationAndUser: vi.fn().mockResolvedValue({ hasAdminPrivileges: () => true }),
      findByOrganization: vi.fn().mockResolvedValue([ownerMember]),
    };
    const useCase = new RemoveMemberFromOrganizationUseCase(memberRepository as never);
    await expect(useCase.execute(1, 10)).rejects.toBeInstanceOf(BadRequestException);
    await expect(useCase.execute(1, 10)).rejects.toThrow(
      OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER,
    );
  });

  it('deletes member when allowed', async () => {
    const memberToRemove = { id: 1, organizationId: 1, role: 'MEMBER' };
    const memberRepository = {
      findById: vi.fn().mockResolvedValue(memberToRemove),
      findByOrganizationAndUser: vi.fn().mockResolvedValue({ hasAdminPrivileges: () => true }),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new RemoveMemberFromOrganizationUseCase(memberRepository as never);
    await useCase.execute(1, 10);
    expect(memberRepository.delete).toHaveBeenCalledWith(1);
  });
});
