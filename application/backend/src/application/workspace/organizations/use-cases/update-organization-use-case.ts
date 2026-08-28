import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { Organization, OrganizationId } from '../../../../domain/organization/entities/organization';
import {
  InsufficientPermissionsError,
  OrganizationNameAlreadyExistsError,
  OrganizationNotFoundError,
} from '../../../../domain/organization/errors';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { UpdateOrganizationDto } from '../dto/update-organization-dto';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(
    organizationId: OrganizationId,
    dto: UpdateOrganizationDto,
    requestingUserId: UserId,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new OrganizationNotFoundError({ organizationId });
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(organizationId, requestingUserId);

    if (!membership?.hasManagementPrivileges()) {
      throw new InsufficientPermissionsError({
        organizationId,
        requestingUserId,
        requestingUserRole: membership?.role ?? null,
      });
    }

    const existing = await this.organizationRepository.findByName(dto.name);

    if (existing && existing.id !== organizationId) {
      throw new OrganizationNameAlreadyExistsError({ name: dto.name });
    }

    return this.organizationRepository.update(organizationId, dto.name, dto.description ?? null, {
      defaultPartySettings: dto.defaultPartySettings ?? null,
    });
  }
}
