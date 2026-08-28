import { inject, injectable } from 'inversify';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../application/workspace/shared/services/identifiers/organization-member-identifier';
import type { PartySettings } from '../../domains/game/party/shared/entities/party-settings';
import type { UserId } from '../../domains/identity/entities/user';
import type { OrganizationId } from '../../domains/organization/entities/organization';
import { type Organization, OrganizationRole } from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import type { OrganizationMember } from '../../domains/organization/entities/organization-member';
import {
  ORGANIZATION_ERROR_DEFINITIONS,
  OrganizationErrorCode,
} from '../../domains/organization/errors/organization-error-code';
import type {
  AddOrganizationMemberCommand,
  CreateOrganizationCommand,
  ListOrganizationMembersQuery,
  ListOrganizationsQuery,
  OrganizationRepository,
  RemoveOrganizationMemberCommand,
  UpdateOrganizationCommand,
  UpdateOrganizationMemberRoleCommand,
} from '../../domains/organization/ports/organization-repository';
import type { PaginatedResult } from '../../domains/shared/value-objects/paginated-result';
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
  UpdateOrganizationDocument,
  UpdateOrganizationMemberRoleDocument,
  type UpdateOrganizationMemberRoleMutation,
  type UpdateOrganizationMemberRoleMutationVariables,
  type UpdateOrganizationMutation,
  type UpdateOrganizationMutationVariables,
  WorkspaceOrganizationDashboardDocument,
  type WorkspaceOrganizationDashboardQuery,
  type WorkspaceOrganizationDashboardQueryVariables,
  WorkspaceOrganizationsDocument,
  type WorkspaceOrganizationsQuery,
  type WorkspaceOrganizationsQueryVariables,
} from '../graphql/generated/graphql';

const DEFAULT_LIST_PAGE = 1;
const DEFAULT_LIST_PAGE_SIZE = 25;

@injectable()
export class GraphqlOrganizationRepository implements OrganizationRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(OrganizationIdentifier)
    private readonly organizationIdentifier: OrganizationIdentifier,
    @inject(OrganizationMemberIdentifier)
    private readonly organizationMemberIdentifier: OrganizationMemberIdentifier,
    @inject(UserIdentifier)
    private readonly userIdentifier: UserIdentifier,
  ) {}

  async getMyOrganizations(query: ListOrganizationsQuery = {}): Promise<PaginatedResult<Organization>> {
    try {
      const result = await this.graphqlClient.request<
        WorkspaceOrganizationsQuery,
        WorkspaceOrganizationsQueryVariables
      >(WorkspaceOrganizationsDocument, {
        input: {
          page: query.page ?? DEFAULT_LIST_PAGE,
          pageSize: query.pageSize ?? DEFAULT_LIST_PAGE_SIZE,
          search: query.search,
        },
      });

      return {
        items: (result.myOrganizations.items ?? []).map((organization) => ({
          id: this.organizationIdentifier.parse(organization.id),
          name: organization.name,
          description: organization.description ?? null,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
          defaultPartySettings: this.toPartySettings(organization.defaultPartySettings),
          role: this.toDomainRole(organization.role),
        })),
        totalCount: result.myOrganizations.totalCount,
        overallCount: result.myOrganizations.overallCount,
        page: result.myOrganizations.page,
        pageSize: result.myOrganizations.pageSize,
        totalPages: result.myOrganizations.totalPages,
      };
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(
        error,
        ORGANIZATION_ERROR_DEFINITIONS[OrganizationErrorCode.LOAD_FAILED],
      );
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
      throw this.graphqlClient.resolveDomainError(
        error,
        ORGANIZATION_ERROR_DEFINITIONS[OrganizationErrorCode.LOAD_FAILED],
      );
    }
  }

  async createOrganization(command: CreateOrganizationCommand): Promise<Organization> {
    try {
      const result = await this.graphqlClient.request<CreateOrganizationMutation, CreateOrganizationMutationVariables>(
        CreateOrganizationDocument,
        {
          input: {
            name: command.name,
            description: command.description,
            defaultPartySettings: command.defaultPartySettings,
          },
        },
      );

      return {
        id: this.organizationIdentifier.parse(result.createOrganization.id),
        name: result.createOrganization.name,
        description: result.createOrganization.description ?? null,
        createdAt: result.createOrganization.createdAt,
        updatedAt: result.createOrganization.updatedAt,
        defaultPartySettings: this.toPartySettings(result.createOrganization.defaultPartySettings),
        role: this.toDomainRole(result.createOrganization.role),
      };
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(
        error,
        ORGANIZATION_ERROR_DEFINITIONS[OrganizationErrorCode.CREATE_FAILED],
      );
    }
  }

  async updateOrganization(command: UpdateOrganizationCommand): Promise<Organization> {
    try {
      const result = await this.graphqlClient.request<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>(
        UpdateOrganizationDocument,
        {
          organizationId: command.organizationId,
          input: {
            name: command.name,
            description: command.description,
            defaultPartySettings: command.defaultPartySettings,
          },
        },
      );

      return {
        id: this.organizationIdentifier.parse(result.updateOrganization.id),
        name: result.updateOrganization.name,
        description: result.updateOrganization.description ?? null,
        createdAt: result.updateOrganization.createdAt,
        updatedAt: result.updateOrganization.updatedAt,
        defaultPartySettings: this.toPartySettings(result.updateOrganization.defaultPartySettings),
        role: this.toDomainRole(result.updateOrganization.role),
      };
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(
        error,
        ORGANIZATION_ERROR_DEFINITIONS[OrganizationErrorCode.UPDATE_FAILED],
      );
    }
  }

  async getOrganizationMembers(query: ListOrganizationMembersQuery): Promise<PaginatedResult<OrganizationMember>> {
    try {
      const result = await this.graphqlClient.request<OrganizationMembersQuery, OrganizationMembersQueryVariables>(
        OrganizationMembersDocument,
        {
          input: {
            organizationId: query.organizationId,
            page: query.page ?? DEFAULT_LIST_PAGE,
            pageSize: query.pageSize ?? DEFAULT_LIST_PAGE_SIZE,
            search: query.search,
          },
        },
      );

      return {
        items: result.organizationMembers.items.map((member) => this.toDomainMember(member)),
        totalCount: result.organizationMembers.totalCount,
        overallCount: result.organizationMembers.overallCount,
        page: result.organizationMembers.page,
        pageSize: result.organizationMembers.pageSize,
        totalPages: result.organizationMembers.totalPages,
      };
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(
        error,
        ORGANIZATION_ERROR_DEFINITIONS[OrganizationErrorCode.LOAD_FAILED],
      );
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
          role: this.toGraphqlRole(command.role),
          usernameOrEmail: command.usernameOrEmail,
        },
      });

      return this.toDomainMember(result.addOrganizationMember);
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(
        error,
        ORGANIZATION_ERROR_DEFINITIONS[OrganizationErrorCode.MEMBER_ADD_FAILED],
      );
    }
  }

  async removeOrganizationMember(command: RemoveOrganizationMemberCommand): Promise<void> {
    try {
      await this.graphqlClient.request<RemoveOrganizationMemberMutation, RemoveOrganizationMemberMutationVariables>(
        RemoveOrganizationMemberDocument,
        { memberId: command.memberId },
      );
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(
        error,
        ORGANIZATION_ERROR_DEFINITIONS[OrganizationErrorCode.MEMBER_REMOVE_FAILED],
      );
    }
  }

  async updateOrganizationMemberRole(command: UpdateOrganizationMemberRoleCommand): Promise<OrganizationMember> {
    try {
      const result = await this.graphqlClient.request<
        UpdateOrganizationMemberRoleMutation,
        UpdateOrganizationMemberRoleMutationVariables
      >(UpdateOrganizationMemberRoleDocument, {
        memberId: command.memberId,
        input: {
          role: this.toGraphqlRole(command.role),
        },
      });

      return this.toDomainMember(result.updateOrganizationMemberRole);
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(
        error,
        ORGANIZATION_ERROR_DEFINITIONS[OrganizationErrorCode.MEMBER_ROLE_UPDATE_FAILED],
      );
    }
  }

  private toDomainMember(member: {
    readonly id: string;
    readonly joinedAt: string;
    readonly organizationId: string;
    readonly role: GraphqlOrganizationRole;
    readonly username: string;
    readonly userId: string;
  }): OrganizationMember {
    return {
      id: this.organizationMemberIdentifier.parse(member.id),
      joinedAt: member.joinedAt,
      organizationId: this.organizationIdentifier.parse(member.organizationId),
      role: this.toDomainRole(member.role) ?? OrganizationRole.MEMBER,
      username: member.username,
      userId: this.userIdentifier.parse(member.userId) as UserId,
    };
  }

  private toDomainRole(role: GraphqlOrganizationRole | null | undefined): OrganizationRole | null {
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

  private toGraphqlRole(role: OrganizationRole): GraphqlOrganizationRole {
    if (role === OrganizationRole.OWNER) {
      return GraphqlOrganizationRole.Owner;
    }

    if (role === OrganizationRole.MANAGER) {
      return GraphqlOrganizationRole.Manager;
    }

    return GraphqlOrganizationRole.Member;
  }

  private toPartySettings(
    settings:
      | {
          readonly allowOptionChangeAfterVoting: boolean;
          readonly randomizeOptionOrder: boolean;
          readonly randomizeStageOrder: boolean;
        }
      | null
      | undefined,
  ): PartySettings | null {
    return settings
      ? {
          allowOptionChangeAfterVoting: settings.allowOptionChangeAfterVoting,
          randomizeOptionOrder: settings.randomizeOptionOrder,
          randomizeStageOrder: settings.randomizeStageOrder,
        }
      : null;
  }
}
