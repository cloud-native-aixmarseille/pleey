import { inject, injectable } from 'inversify';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../application/workspace/shared/services/identifiers/organization-member-identifier';
import type { OrganizationId } from '../../domains/organization/entities/organization';
import {
  type Organization,
  OrganizationRole,
} from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import type { OrganizationMember } from '../../domains/organization/entities/organization-member';
import { OrganizationErrorCode } from '../../domains/organization/errors/organization-error-code';
import type {
  AddOrganizationMemberCommand,
  CreateOrganizationCommand,
  OrganizationRepository,
  RemoveOrganizationMemberCommand,
  UpdateOrganizationMemberRoleCommand,
} from '../../domains/organization/ports/organization-repository';
import { GraphqlClient } from '../graphql/client/graphql-client';
import {
  AddOrganizationMemberDocument,
  type AddOrganizationMemberMutation,
  type AddOrganizationMemberMutationVariables,
  CreateOrganizationDocument,
  type CreateOrganizationMutation,
  type CreateOrganizationMutationVariables,
  OrganizationRole as GraphqlOrganizationRole,
  OrganizationMembersDocument,
  type OrganizationMembersQuery,
  type OrganizationMembersQueryVariables,
  RemoveOrganizationMemberDocument,
  type RemoveOrganizationMemberMutation,
  type RemoveOrganizationMemberMutationVariables,
  UpdateOrganizationMemberRoleDocument,
  type UpdateOrganizationMemberRoleMutation,
  type UpdateOrganizationMemberRoleMutationVariables,
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

function toGraphqlRole(role: OrganizationRole): GraphqlOrganizationRole {
  if (role === OrganizationRole.OWNER) {
    return GraphqlOrganizationRole.Owner;
  }

  if (role === OrganizationRole.MANAGER) {
    return GraphqlOrganizationRole.Manager;
  }

  return GraphqlOrganizationRole.Member;
}

@injectable()
export class GraphqlOrganizationRepository implements OrganizationRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(OrganizationIdentifier)
    private readonly organizationIdentifier: OrganizationIdentifier,
    @inject(OrganizationMemberIdentifier)
    private readonly organizationMemberIdentifier: OrganizationMemberIdentifier,
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

  async getOrganizationMembers(organizationId: OrganizationId): Promise<OrganizationMember[]> {
    try {
      const result = await this.graphqlClient.request<
        OrganizationMembersQuery,
        OrganizationMembersQueryVariables
      >(OrganizationMembersDocument, { organizationId });

      return result.organizationMembers.members.map((member) => this.toDomainMember(member));
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, OrganizationErrorCode.LOAD_FAILED));
    }
  }

  async addOrganizationMember(command: AddOrganizationMemberCommand): Promise<OrganizationMember> {
    try {
      const result = await this.graphqlClient.request<
        AddOrganizationMemberMutation,
        AddOrganizationMemberMutationVariables
      >(AddOrganizationMemberDocument, {
        organizationId: command.organizationId,
        input: {
          role: toGraphqlRole(command.role),
          usernameOrEmail: command.usernameOrEmail,
        },
      });

      return this.toDomainMember(result.addOrganizationMember);
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, OrganizationErrorCode.MEMBER_ADD_FAILED),
      );
    }
  }

  async removeOrganizationMember(command: RemoveOrganizationMemberCommand): Promise<void> {
    try {
      await this.graphqlClient.request<
        RemoveOrganizationMemberMutation,
        RemoveOrganizationMemberMutationVariables
      >(RemoveOrganizationMemberDocument, { memberId: command.memberId });
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, OrganizationErrorCode.MEMBER_REMOVE_FAILED),
      );
    }
  }

  async updateOrganizationMemberRole(
    command: UpdateOrganizationMemberRoleCommand,
  ): Promise<OrganizationMember> {
    try {
      const result = await this.graphqlClient.request<
        UpdateOrganizationMemberRoleMutation,
        UpdateOrganizationMemberRoleMutationVariables
      >(UpdateOrganizationMemberRoleDocument, {
        memberId: command.memberId,
        input: {
          role: toGraphqlRole(command.role),
        },
      });

      return this.toDomainMember(result.updateOrganizationMemberRole);
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, OrganizationErrorCode.MEMBER_ROLE_UPDATE_FAILED),
      );
    }
  }

  private toDomainMember(member: {
    readonly id: number;
    readonly joinedAt: string;
    readonly organizationId: number;
    readonly role: GraphqlOrganizationRole;
    readonly username: string;
    readonly userId: number;
  }): OrganizationMember {
    return {
      id: this.organizationMemberIdentifier.parse(member.id),
      joinedAt: member.joinedAt,
      organizationId: this.organizationIdentifier.parse(member.organizationId),
      role: toDomainRole(member.role) ?? OrganizationRole.MEMBER,
      username: member.username,
      userId: member.userId,
    };
  }
}
