import { ConflictException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../test-utils/mock-factories';
import type { CreateOrganizationDto } from '../dto/create-organization.dto';
import { CreateOrganizationUseCase } from './create-organization.use-case';

describe('CreateOrganizationUseCase', () => {
  it('throws when organization name already exists', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findByName: { id: 1 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock();
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
    const organizationRepository = createOrganizationRepositoryMock({
      findByName: null,
      create: { id: 10, name: 'Org', description: null } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({ create: undefined });
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
