import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetOrganizationDashboardUseCase } from '../../../application/workspace/dashboard/use-cases/get-organization-dashboard-use-case';
import { AddMemberToOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/add-member-to-organization-use-case';
import { CreateOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/create-organization-use-case';
import { ListOrganizationMembersUseCase } from '../../../application/workspace/organizations/use-cases/list-organization-members-use-case';
import { ListUserOrganizationsUseCase } from '../../../application/workspace/organizations/use-cases/list-user-organizations-use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/remove-member-from-organization-use-case';
import { UpdateOrganizationMemberRoleUseCase } from '../../../application/workspace/organizations/use-cases/update-organization-member-role-use-case';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import type { UserId } from '../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import { GqlJwtAuthGuard } from '../../identity/shared/guards/gql-jwt-auth-guard';
import {
  AddOrganizationMemberInput,
  CreateOrganizationInput,
  UpdateOrganizationMemberRoleInput,
} from './types/organization.input';
import {
  OrganizationDashboardType,
  OrganizationListType,
  OrganizationMemberListType,
  OrganizationMemberType,
  OrganizationType,
} from './types/organization.type';

type GraphqlAuthContext = {
  req?: {
    user?: {
      id: UserId;
    };
  };
  user?: {
    id: UserId;
  };
};

@Resolver()
export class OrganizationResolver {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly listUserOrganizationsUseCase: ListUserOrganizationsUseCase,
    private readonly listOrganizationMembersUseCase: ListOrganizationMembersUseCase,
    private readonly addMemberToOrganizationUseCase: AddMemberToOrganizationUseCase,
    private readonly removeMemberFromOrganizationUseCase: RemoveMemberFromOrganizationUseCase,
    private readonly updateOrganizationMemberRoleUseCase: UpdateOrganizationMemberRoleUseCase,
    private readonly getOrganizationDashboardUseCase: GetOrganizationDashboardUseCase,
    private readonly organizationIdentifier: OrganizationIdentifier,
    private readonly organizationMemberIdentifier: OrganizationMemberIdentifier,
  ) {}

  @Mutation(() => OrganizationType)
  @UseGuards(GqlJwtAuthGuard)
  async createOrganization(
    @Args('input') input: CreateOrganizationInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<OrganizationType> {
    const userId = this.resolveUserId(context);
    const organization = await this.createOrganizationUseCase.execute(input, userId);
    return { ...organization, role: OrganizationRole.OWNER };
  }

  @Query(() => OrganizationListType)
  @UseGuards(GqlJwtAuthGuard)
  async myOrganizations(@Context() context: GraphqlAuthContext): Promise<OrganizationListType> {
    const userId = this.resolveUserId(context);
    const organizations = await this.listUserOrganizationsUseCase.execute(userId);
    return { organizations };
  }

  @Query(() => OrganizationDashboardType)
  @UseGuards(GqlJwtAuthGuard)
  async organizationDashboard(
    @Args('organizationId', { type: () => Int }) organizationId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<OrganizationDashboardType> {
    const userId = this.resolveUserId(context);
    return this.getOrganizationDashboardUseCase.execute(
      this.organizationIdentifier.parse(organizationId),
      userId,
    );
  }

  @Query(() => OrganizationMemberListType)
  @UseGuards(GqlJwtAuthGuard)
  async organizationMembers(
    @Args('organizationId', { type: () => Int }) organizationId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<OrganizationMemberListType> {
    const userId = this.resolveUserId(context);
    const members = await this.listOrganizationMembersUseCase.execute(
      this.organizationIdentifier.parse(organizationId),
      userId,
    );
    return { members };
  }

  @Mutation(() => OrganizationMemberType)
  @UseGuards(GqlJwtAuthGuard)
  async addOrganizationMember(
    @Args('organizationId', { type: () => Int }) organizationId: number,
    @Args('input') input: AddOrganizationMemberInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<OrganizationMemberType> {
    const userId = this.resolveUserId(context);
    return this.addMemberToOrganizationUseCase.execute(
      this.organizationIdentifier.parse(organizationId),
      input,
      userId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async removeOrganizationMember(
    @Args('memberId', { type: () => Int }) memberId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<boolean> {
    const userId = this.resolveUserId(context);
    await this.removeMemberFromOrganizationUseCase.execute(
      this.organizationMemberIdentifier.parse(memberId),
      userId,
    );
    return true;
  }

  @Mutation(() => OrganizationMemberType)
  @UseGuards(GqlJwtAuthGuard)
  async updateOrganizationMemberRole(
    @Args('memberId', { type: () => Int }) memberId: number,
    @Args('input') input: UpdateOrganizationMemberRoleInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<OrganizationMemberType> {
    const userId = this.resolveUserId(context);
    return this.updateOrganizationMemberRoleUseCase.execute(
      this.organizationMemberIdentifier.parse(memberId),
      input.role,
      userId,
    );
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}
