import { inject, injectable } from 'inversify';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import type { OrganizationId } from '../../domains/organization/entities/organization';
import {
  type Organization,
  OrganizationRole,
} from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import { OrganizationErrorCode } from '../../domains/organization/errors/organization-error-code';
import type {
  CreateOrganizationCommand,
  OrganizationRepository,
} from '../../domains/organization/ports/organization-repository';
import { GraphqlClient } from '../graphql/client/graphql-client';
import {
  CreateOrganizationDocument,
  type CreateOrganizationMutation,
  type CreateOrganizationMutationVariables,
  OrganizationRole as GraphqlOrganizationRole,
  WorkspaceOrganizationDashboardDocument,
  type WorkspaceOrganizationDashboardQuery,
  type WorkspaceOrganizationDashboardQueryVariables,
  WorkspaceOrganizationsDocument,
  type WorkspaceOrganizationsQuery,
} from '../graphql/generated/graphql';

function toDomainRole(role: GraphqlOrganizationRole | null | undefined): OrganizationRole | null {
  if (role === GraphqlOrganizationRole.Owner) {
    return OrganizationRole.OWNER;
  }

  if (role === GraphqlOrganizationRole.Manager) {
    return OrganizationRole.MANAGER;
  }

  if (role === GraphqlOrganizationRole.Member) {
    return OrganizationRole.MEMBER;
  }

  return null;
}

@injectable()
export class GraphqlOrganizationRepository implements OrganizationRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(OrganizationIdentifier)
    private readonly organizationIdentifier: OrganizationIdentifier,
  ) {}

  async getMyOrganizations(): Promise<Organization[]> {
    try {
      const result = await this.graphqlClient.request<WorkspaceOrganizationsQuery>(
        WorkspaceOrganizationsDocument,
      );

      return (result.myOrganizations.organizations ?? []).map((organization) => ({
        id: this.organizationIdentifier.parse(organization.id),
        name: organization.name,
        description: organization.description ?? null,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        role: toDomainRole(organization.role),
      }));
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, OrganizationErrorCode.LOAD_FAILED));
    }
  }

  async getOrganizationDashboard(organizationId: OrganizationId): Promise<OrganizationDashboard> {
    try {
      const result = await this.graphqlClient.request<
        WorkspaceOrganizationDashboardQuery,
        WorkspaceOrganizationDashboardQueryVariables
      >(WorkspaceOrganizationDashboardDocument, { organizationId });

      return {
        organization: {
          id: this.organizationIdentifier.parse(result.organizationDashboard.organization.id),
          name: result.organizationDashboard.organization.name,
          description: result.organizationDashboard.organization.description ?? null,
        },
        stats: {
          totalGames: result.organizationDashboard.stats.totalGames,
          totalMembers: result.organizationDashboard.stats.totalMembers,
          totalProjects: result.organizationDashboard.stats.totalProjects,
        },
      };
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, OrganizationErrorCode.LOAD_FAILED));
    }
  }

  async createOrganization(command: CreateOrganizationCommand): Promise<Organization> {
    try {
      const result = await this.graphqlClient.request<
        CreateOrganizationMutation,
        CreateOrganizationMutationVariables
      >(CreateOrganizationDocument, {
        input: {
          name: command.name,
          description: command.description,
        },
      });

      return {
        id: this.organizationIdentifier.parse(result.createOrganization.id),
        name: result.createOrganization.name,
        description: result.createOrganization.description ?? null,
        createdAt: result.createOrganization.createdAt,
        updatedAt: result.createOrganization.updatedAt,
        role: toDomainRole(result.createOrganization.role),
      };
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, OrganizationErrorCode.CREATE_FAILED),
      );
    }
  }
}
