import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import type { CreateOrganizationDto } from '../dto/create-organization.dto';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { CreateOrganizationUseCase } from './create-organization.use-case';

describe('CreateOrganizationUseCase', () => {
  it('throws when organization name already exists', async () => {
    const organizationRepository = {
      findByName: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn(),
    };
    const memberRepository = { create: vi.fn() };
    const useCase = new CreateOrganizationUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    await expect(
      useCase.execute({ name: 'Org', description: '' } satisfies CreateOrganizationDto, 1),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      useCase.execute({ name: 'Org', description: '' } satisfies CreateOrganizationDto, 1),
    ).rejects.toThrow(OrganizationErrorCode.ORGANIZATION_NAME_ALREADY_EXISTS);
  });

  it('creates organization and assigns owner role', async () => {
    const organizationRepository = {
      findByName: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 10, name: 'Org', description: null }),
    };
    const memberRepository = { create: vi.fn().mockResolvedValue(undefined) };
    const useCase = new CreateOrganizationUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const dto: CreateOrganizationDto = { name: 'Org' };
    const org = await useCase.execute(dto, 1);
    expect(memberRepository.create).toHaveBeenCalledWith(10, 1, OrganizationRole.OWNER);
    expect(org).toMatchObject({ id: 10, name: 'Org' });
  });
});
