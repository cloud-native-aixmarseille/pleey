import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/identity/ports/user.repository';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { MemberAlreadyExistsError, MemberUserNotFoundError } from '../../../../domain/organization/errors';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { AddMemberDto } from '../dto/add-member-dto';
import type { OrganizationMemberWithAccess } from '../dto/organization-access.dto';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';

/**
 * Use case for adding a member to an organization
 * Requires management privileges in the organization
 */
@Injectable()
export class AddMemberToOrganizationUseCase {
  constructor(
    private readonly organizationMembershipAccess: OrganizationMembershipAccessService,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    organizationId: OrganizationId,
    dto: AddMemberDto,
    requestingUserId: UserId,
  ): Promise<OrganizationMemberWithAccess> {
    await this.organizationMembershipAccess.assertOrganizationExists(organizationId);
    const requestingMember = await this.organizationMembershipAccess.requireManager(organizationId, requestingUserId);
    this.organizationMembershipAccess.assertCanAssignRole(requestingMember, dto.role);

    const memberUserId = await this.resolveMemberUserId(dto.usernameOrEmail);

    const existingMember = await this.memberRepository.findByOrganizationAndUser(organizationId, memberUserId);
    if (existingMember) {
      throw new MemberAlreadyExistsError({ memberUserId, organizationId });
    }

    const member = await this.memberRepository.create(organizationId, memberUserId, dto.role);
    const ownerCount = await this.memberRepository.countOwnersByOrganization(organizationId);
    return this.organizationMembershipAccess.memberAccess(requestingMember, member, ownerCount);
  }

  private async resolveMemberUserId(usernameOrEmail: string): Promise<UserId> {
    const normalizedUsernameOrEmail = usernameOrEmail.trim();
    const user = normalizedUsernameOrEmail.includes('@')
      ? ((await this.userRepository.findByEmail(normalizedUsernameOrEmail)) ??
        (await this.userRepository.findByUsername(normalizedUsernameOrEmail)))
      : await this.userRepository.findByUsername(normalizedUsernameOrEmail);

    if (!user) {
      throw new MemberUserNotFoundError({ usernameOrEmail: normalizedUsernameOrEmail });
    }

    return user.id;
  }
}
