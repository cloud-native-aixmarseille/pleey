import { Module } from '@nestjs/common';
import { OrganizationMembershipAccessService } from '../../../application/workspace/organizations/services/organization-membership-access.service';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { OrganizationRepositoryProvider } from '../../../domain/organization/ports/organization.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import {
  OrganizationMembershipPolicy,
  OrganizationMembershipPolicyProvider,
} from '../../../domain/organization/services/organization-membership-policy';
import { PrismaPartySettingsMapper } from '../../../infrastructure/game/shared/prisma-party-settings.mapper';
import { PrismaOrganizationMemberRepository } from '../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaOrganizationRepository } from '../../../infrastructure/organization/repositories/prisma-organization-repository';
import { DatabaseModule } from '../database/database-module';
import { SharedServicesModule } from '../shared/shared-services.module';

@Module({
  imports: [DatabaseModule, SharedServicesModule],
  providers: [
    OrganizationIdentifier,
    OrganizationMemberIdentifier,
    PrismaPartySettingsMapper,
    PrismaOrganizationRepository,
    PrismaOrganizationMemberRepository,
    { provide: OrganizationRepositoryProvider, useExisting: PrismaOrganizationRepository },
    { provide: OrganizationMemberRepositoryProvider, useExisting: PrismaOrganizationMemberRepository },
    { provide: OrganizationMembershipPolicyProvider, useValue: new OrganizationMembershipPolicy() },
    OrganizationMembershipAccessService,
  ],
  exports: [
    OrganizationRepositoryProvider,
    OrganizationMemberRepositoryProvider,
    OrganizationMembershipPolicyProvider,
    OrganizationMembershipAccessService,
  ],
})
export class OrganizationAccessModule {}
