import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProjectUseCase } from '../../../application/workspace/projects/use-cases/create-project-use-case';
import { DeleteProjectUseCase } from '../../../application/workspace/projects/use-cases/delete-project-use-case';
import { ListOrganizationProjectsUseCase } from '../../../application/workspace/projects/use-cases/list-organization-projects-use-case';
import { UpdateProjectUseCase } from '../../../application/workspace/projects/use-cases/update-project-use-case';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import type { UserId } from '../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { GqlJwtAuthGuard } from '../../identity/shared/guards/gql-jwt-auth-guard';
import { CreateProjectInput } from './types/create-project-input';
import { ListOrganizationProjectsInput } from './types/list-organization-projects-input';
import { ProjectListType } from './types/project-list-type';
import { ProjectType } from './types/project-type';
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
    private readonly organizationIdentifier: OrganizationIdentifier,
    private readonly projectIdentifier: ProjectIdentifier,
  ) {}

  @Query(() => ProjectListType)
  @UseGuards(GqlJwtAuthGuard)
  async organizationProjects(
    @Args('input') input: ListOrganizationProjectsInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<ProjectListType> {
    const userId = this.resolveUserId(context);

    return this.listOrganizationProjectsUseCase.execute(
      {
        ...input,
        organizationId: this.organizationIdentifier.parse(input.organizationId),
      },
      userId,
    );
  }

  @Mutation(() => ProjectType)
  @UseGuards(GqlJwtAuthGuard)
  async createProject(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Args('input') input: CreateProjectInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<ProjectType> {
    const userId = this.resolveUserId(context);
    return this.createProjectUseCase.execute(
      this.organizationIdentifier.parse(organizationId),
      input,
      userId,
    );
  }

  @Mutation(() => ProjectType)
  @UseGuards(GqlJwtAuthGuard)
  async updateProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('input') input: UpdateProjectInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<ProjectType> {
    const userId = this.resolveUserId(context);
    return this.updateProjectUseCase.execute(
      this.projectIdentifier.parse(projectId),
      input,
      userId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deleteProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Context() context: GraphqlAuthContext,
    @Args('migrationProjectId', { type: () => ID, nullable: true }) migrationProjectId?: string,
  ): Promise<boolean> {
    const userId = this.resolveUserId(context);
    await this.deleteProjectUseCase.execute(
      this.projectIdentifier.parse(projectId),
      userId,
      migrationProjectId === undefined
        ? undefined
        : this.projectIdentifier.parse(migrationProjectId),
    );
    return true;
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}
