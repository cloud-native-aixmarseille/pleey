import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { OrganizationNameAlreadyExistsError, OrganizationNotFoundError } from '../../../../domain/organization/errors';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import { ThemeSelectionService } from '../../themes/services/theme-selection-service';
import type { OrganizationWithAccess } from '../dto/organization-access.dto';
import type { UpdateOrganizationDto } from '../dto/update-organization-dto';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    private readonly membershipAccess: OrganizationMembershipAccessService,
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    private readonly themeSelection: ThemeSelectionService,
  ) {}

  async execute(
    organizationId: OrganizationId,
    dto: UpdateOrganizationDto,
    requestingUserId: UserId,
  ): Promise<OrganizationWithAccess> {
    const organization = await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new OrganizationNotFoundError({ organizationId });
    }

    const membership = await this.membershipAccess.requireManager(organizationId, requestingUserId);

    const existing = await this.organizationRepository.findByName(dto.name);

    if (existing && existing.id !== organizationId) {
      throw new OrganizationNameAlreadyExistsError({ name: dto.name });
    }

    if (dto.defaultThemeId != null) {
      await this.themeSelection.resolve(organizationId, { organizationDefaultThemeId: dto.defaultThemeId });
    }

    const updated = await this.organizationRepository.update(organizationId, dto.name, dto.description ?? null, {
      defaultPartySettings: dto.defaultPartySettings ?? null,
      defaultThemeId: dto.defaultThemeId,
    });
    return this.membershipAccess.organizationAccess(updated, membership);
  }
}
