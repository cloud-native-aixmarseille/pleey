import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProjectUseCase } from '../../../application/workspace/projects/use-cases/create-project-use-case';
import { DeleteProjectUseCase } from '../../../application/workspace/projects/use-cases/delete-project-use-case';
import { ListOrganizationProjectsUseCase } from '../../../application/workspace/projects/use-cases/list-organization-projects-use-case';
import { UpdateProjectUseCase } from '../../../application/workspace/projects/use-cases/update-project-use-case';
import type { UserId } from '../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { GqlJwtAuthGuard } from '../../identity/shared/guards/gql-jwt-auth-guard';
import { CreateProjectInput } from './types/create-project-input';
import { ProjectListType, ProjectType } from './types/organization.type';
import { UpdateProjectInput } from './types/update-project-input';

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
export class ProjectResolver {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly listOrganizationProjectsUseCase: ListOrganizationProjectsUseCase,
  ) {}

  @Query(() => ProjectListType)
  @UseGuards(GqlJwtAuthGuard)
  async organizationProjects(
    @Args('organizationId', { type: () => Int }) organizationId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<ProjectListType> {
    const userId = this.resolveUserId(context);
    const projects = await this.listOrganizationProjectsUseCase.execute(organizationId, userId);

    return { projects };
  }

  @Mutation(() => ProjectType)
  @UseGuards(GqlJwtAuthGuard)
  async createProject(
    @Args('organizationId', { type: () => Int }) organizationId: number,
    @Args('input') input: CreateProjectInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<ProjectType> {
    const userId = this.resolveUserId(context);
    return this.createProjectUseCase.execute(organizationId, input, userId);
  }

  @Mutation(() => ProjectType)
  @UseGuards(GqlJwtAuthGuard)
  async updateProject(
    @Args('projectId', { type: () => Int }) projectId: number,
    @Args('input') input: UpdateProjectInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<ProjectType> {
    const userId = this.resolveUserId(context);
    return this.updateProjectUseCase.execute(projectId, input, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deleteProject(
    @Args('projectId', { type: () => Int }) projectId: number,
    @Context() context: GraphqlAuthContext,
    @Args('migrationProjectId', { type: () => Int, nullable: true }) migrationProjectId?: number,
  ): Promise<boolean> {
    const userId = this.resolveUserId(context);
    await this.deleteProjectUseCase.execute(projectId, userId, migrationProjectId);
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
