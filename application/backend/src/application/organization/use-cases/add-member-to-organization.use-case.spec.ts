import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import type { AddMemberDto } from '../dto/add-member.dto';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { AddMemberToOrganizationUseCase } from './add-member-to-organization.use-case';

describe('AddMemberToOrganizationUseCase', () => {
  it('throws when organization does not exist', async () => {
    const organizationRepository = { findById: vi.fn().mockResolvedValue(null) };
    const memberRepository = { findByOrganizationAndUser: vi.fn(), create: vi.fn() };

    const useCase = new AddMemberToOrganizationUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const dto: AddMemberDto = { userId: 2, role: OrganizationRole.MEMBER };

    await expect(useCase.execute(1, dto, 10)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(1, dto, 10)).rejects.toThrow(
      OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
    );
  });

  it('throws when requesting user lacks admin privileges', async () => {
    const organizationRepository = { findById: vi.fn().mockResolvedValue({ id: 1 }) };
    const memberRepository = {
      findByOrganizationAndUser: vi
        .fn()
        .mockResolvedValueOnce({ hasAdminPrivileges: () => false })
        .mockResolvedValueOnce(null),
      create: vi.fn(),
    };

    const useCase = new AddMemberToOrganizationUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const dto: AddMemberDto = { userId: 2, role: OrganizationRole.MEMBER };

    await expect(useCase.execute(1, dto, 10)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('adds member when allowed', async () => {
    const organizationRepository = { findById: vi.fn().mockResolvedValue({ id: 1 }) };
    const memberRepository = {
      findByOrganizationAndUser: vi
        .fn()
        .mockResolvedValueOnce({ hasAdminPrivileges: () => true })
        .mockResolvedValueOnce(null),
      create: vi.fn().mockResolvedValue({ id: 123 }),
    };

    const useCase = new AddMemberToOrganizationUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const dto: AddMemberDto = { userId: 2, role: OrganizationRole.MEMBER };

    const result = await useCase.execute(1, dto, 10);
    expect(memberRepository.create).toHaveBeenCalledWith(1, 2, OrganizationRole.MEMBER);
    expect(result).toMatchObject({ id: 123 });
  });
});
