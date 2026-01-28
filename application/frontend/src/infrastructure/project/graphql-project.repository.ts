import { inject, injectable } from 'inversify';
import type { Project } from '../../domains/project/entities/project';
import { ProjectErrorCode } from '../../domains/project/errors/project-error-code';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  ProjectRepository,
  UpdateProjectCommand,
} from '../../domains/project/ports/project-repository';
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

@injectable()
export class GraphqlProjectRepository implements ProjectRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
  ) {}

  async getProjectsByOrganization(organizationId: number): Promise<Project[]> {
    try {
      const result = await this.graphqlClient.request<
        WorkspaceProjectsByOrganizationQuery,
        WorkspaceProjectsByOrganizationQueryVariables
      >(WorkspaceProjectsByOrganizationDocument, { organizationId });

      return (result.organizationProjects.projects ?? []).map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description ?? null,
        organizationId: project.organizationId,
        createdAt: project.createdAt,
      }));
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
      id: project.id,
      name: project.name,
      description: project.description ?? null,
      organizationId: project.organizationId,
      createdAt: project.createdAt,
    };
  }
}
