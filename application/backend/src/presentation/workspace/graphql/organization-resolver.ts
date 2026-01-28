import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetOrganizationDashboardUseCase } from '../../../application/workspace/dashboard/use-cases/get-organization-dashboard-use-case';
import { ListProjectDashboardGamesUseCase } from '../../../application/workspace/dashboard/use-cases/list-project-dashboard-games-use-case';
import { AddMemberToOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/add-member-to-organization-use-case';
import { CreateOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/create-organization-use-case';
import { ListUserOrganizationsUseCase } from '../../../application/workspace/organizations/use-cases/list-user-organizations-use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/remove-member-from-organization-use-case';
import type { UserId } from '../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { GqlJwtAuthGuard } from '../../identity/shared/guards/gql-jwt-auth-guard';
import { AddOrganizationMemberInput, CreateOrganizationInput } from './types/organization.input';
import {
  OrganizationDashboardType,
  OrganizationListType,
  OrganizationMemberType,
  OrganizationType,
} from './types/organization.type';
import { ProjectDashboardGamesInput } from './types/project-dashboard-games-input';
import { ProjectDashboardGamesType } from './types/project-dashboard-games-type';

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
    private readonly addMemberToOrganizationUseCase: AddMemberToOrganizationUseCase,
    private readonly removeMemberFromOrganizationUseCase: RemoveMemberFromOrganizationUseCase,
    private readonly getOrganizationDashboardUseCase: GetOrganizationDashboardUseCase,
    private readonly listProjectDashboardGamesUseCase: ListProjectDashboardGamesUseCase,
  ) {}

  @Mutation(() => OrganizationType)
  @UseGuards(GqlJwtAuthGuard)
  async createOrganization(
    @Args('input') input: CreateOrganizationInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<OrganizationType> {
    const userId = this.resolveUserId(context);
    return this.createOrganizationUseCase.execute(input, userId);
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
    return this.getOrganizationDashboardUseCase.execute(organizationId, userId);
  }

  @Query(() => ProjectDashboardGamesType)
  @UseGuards(GqlJwtAuthGuard)
  async projectDashboardGames(
    @Args('input') input: ProjectDashboardGamesInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<ProjectDashboardGamesType> {
    const userId = this.resolveUserId(context);
    const result = await this.listProjectDashboardGamesUseCase.execute(input, userId);

    return {
      items: result.items,
      totalCount: result.totalCount,
      overallCount: result.overallCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }

  @Mutation(() => OrganizationMemberType)
  @UseGuards(GqlJwtAuthGuard)
  async addOrganizationMember(
    @Args('organizationId', { type: () => Int }) organizationId: number,
    @Args('input') input: AddOrganizationMemberInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<OrganizationMemberType> {
    const userId = this.resolveUserId(context);
    return this.addMemberToOrganizationUseCase.execute(organizationId, input, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async removeOrganizationMember(
    @Args('memberId', { type: () => Int }) memberId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<boolean> {
    const userId = this.resolveUserId(context);
    await this.removeMemberFromOrganizationUseCase.execute(memberId, userId);
    return true;
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(AuthErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}
