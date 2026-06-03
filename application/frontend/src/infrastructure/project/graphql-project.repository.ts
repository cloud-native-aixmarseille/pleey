import { inject, injectable } from 'inversify';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../application/workspace/shared/services/identifiers/project-identifier';
import type { Project } from '../../domains/project/entities/project';
import { ProjectErrorCode } from '../../domains/project/errors/project-error-code';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  ListOrganizationProjectsQuery,
  ProjectRepository,
  UpdateProjectCommand,
} from '../../domains/project/ports/project-repository';
import type { PaginatedResult } from '../../domains/shared/value-objects/paginated-result';
import { GraphqlClient } from '../graphql/client/graphql-client';
import {
  CreateProjectDocument,
  type CreateProjectMutation,
  type CreateProjectMutationVariables,
  DeleteProjectDocument,
  type DeleteProjectMutation,
  type DeleteProjectMutationVariables,
  UpdateProjectDocument,
  type UpdateProjectMutation,
  type UpdateProjectMutationVariables,
  WorkspaceProjectsByOrganizationDocument,
  type WorkspaceProjectsByOrganizationQuery,
  type WorkspaceProjectsByOrganizationQueryVariables,
} from '../graphql/generated/graphql';

const DEFAULT_LIST_PAGE = 1;
const DEFAULT_LIST_PAGE_SIZE = 25;

@injectable()
export class GraphqlProjectRepository implements ProjectRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(ProjectIdentifier)
    private readonly projectIdentifier: ProjectIdentifier,
    @inject(OrganizationIdentifier)
    private readonly organizationIdentifier: OrganizationIdentifier,
  ) {}

  async getProjectsByOrganization(
    query: ListOrganizationProjectsQuery,
  ): Promise<PaginatedResult<Project>> {
    try {
      const result = await this.graphqlClient.request<
        WorkspaceProjectsByOrganizationQuery,
        WorkspaceProjectsByOrganizationQueryVariables
      >(WorkspaceProjectsByOrganizationDocument, {
        input: {
          organizationId: query.organizationId,
          page: query.page ?? DEFAULT_LIST_PAGE,
          pageSize: query.pageSize ?? DEFAULT_LIST_PAGE_SIZE,
          search: query.search,
        },
      });

      return {
        items: (result.organizationProjects.items ?? []).map((project) => ({
          id: this.projectIdentifier.parse(project.id),
          name: project.name,
          description: project.description ?? null,
          organizationId: this.organizationIdentifier.parse(project.organizationId),
          createdAt: project.createdAt,
        })),
        totalCount: result.organizationProjects.totalCount,
        overallCount: result.organizationProjects.overallCount,
        page: result.organizationProjects.page,
        pageSize: result.organizationProjects.pageSize,
        totalPages: result.organizationProjects.totalPages,
      };
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, ProjectErrorCode.LOAD_FAILED));
    }
  }

  async createProject(command: CreateProjectCommand): Promise<Project> {
    try {
      const result = await this.graphqlClient.request<
        CreateProjectMutation,
        CreateProjectMutationVariables
      >(CreateProjectDocument, {
        organizationId: command.organizationId,
        input: {
          name: command.name,
          description: command.description,
        },
      });

      return this.toDomainProject(result.createProject);
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, ProjectErrorCode.CREATE_FAILED));
    }
  }

  async updateProject(command: UpdateProjectCommand): Promise<Project> {
    try {
      const result = await this.graphqlClient.request<
        UpdateProjectMutation,
        UpdateProjectMutationVariables
      >(UpdateProjectDocument, {
        projectId: command.projectId,
        input: {
          name: command.name,
          description: command.description,
        },
      });

      return this.toDomainProject(result.updateProject);
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, ProjectErrorCode.UPDATE_FAILED));
    }
  }

  async deleteProject(command: DeleteProjectCommand): Promise<void> {
    try {
      await this.graphqlClient.request<DeleteProjectMutation, DeleteProjectMutationVariables>(
        DeleteProjectDocument,
        {
          projectId: command.projectId,
          migrationProjectId: command.migrationProjectId,
        },
      );
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, ProjectErrorCode.DELETE_FAILED));
    }
  }

  private toDomainProject(project: {
    readonly id: number;
    readonly name: string;
    readonly description?: string | null;
    readonly organizationId: number;
    readonly createdAt: string;
  }): Project {
    return {
      id: this.projectIdentifier.parse(project.id),
      name: project.name,
      description: project.description ?? null,
      organizationId: this.organizationIdentifier.parse(project.organizationId),
      createdAt: project.createdAt,
    };
  }
}
