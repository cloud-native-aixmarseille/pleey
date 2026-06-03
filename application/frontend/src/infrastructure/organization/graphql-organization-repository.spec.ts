import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { OrganizationRole } from '../../domains/organization/entities/organization';
import { OrganizationErrorCode } from '../../domains/organization/errors/organization-error-code';
import { OrganizationFixtureFactory } from '../../test-utils/fixtures/organization-fixture-factory';
import { coerceUuidV7TestValue } from '../../test-utils/fixtures/uuid-v7-test-value';
import { GraphqlClientMockFactory } from '../../test-utils/mocks/graphql-client-mock-factory';
import { GraphqlOrganizationRepository } from './graphql-organization.repository';

const organizationIdentifier = new OrganizationIdentifier();
const organizationMemberIdentifier = new OrganizationMemberIdentifier();
const userIdentifier = new UserIdentifier();
const organizationFixtureFactory = new OrganizationFixtureFactory();
const parseOrganizationId = (value: number) =>
  organizationIdentifier.parse(coerceUuidV7TestValue(value));
const parseOrganizationMemberId = (value: number) =>
  organizationMemberIdentifier.parse(coerceUuidV7TestValue(value));
const parseUserId = (value: number) => userIdentifier.parse(coerceUuidV7TestValue(value));

function createRepository(client: ConstructorParameters<typeof GraphqlOrganizationRepository>[0]) {
  return new GraphqlOrganizationRepository(
    client,
    organizationIdentifier,
    organizationMemberIdentifier,
    userIdentifier,
  );
}

describe('GraphqlOrganizationRepository', () => {
  describe('getMyOrganizations()', () => {
    it('returns a paginated organization result', async () => {
      // Arrange
      const { client, requestMock } = new GraphqlClientMockFactory().create({
        requestResult: {
          myOrganizations: {
            items: [
              {
                id: parseOrganizationId(9),
                name: 'Pleey Org',
                description: 'Main workspace',
                createdAt: '2026-03-10T12:00:00.000Z',
                updatedAt: '2026-03-10T12:00:00.000Z',
                role: 'OWNER',
              },
            ],
            totalCount: 1,
            overallCount: 5,
            page: 2,
            pageSize: 25,
            totalPages: 5,
          },
        },
      });
      const repository = createRepository(client);

      // Act
      const organizations = await repository.getMyOrganizations({
        page: 2,
        pageSize: 25,
        search: 'Pleey',
      });

      // Assert
      expect(organizations).toEqual({
        items: [
          organizationFixtureFactory.createOrganization({
            id: parseOrganizationId(9),
            name: 'Pleey Org',
            description: 'Main workspace',
            createdAt: '2026-03-10T12:00:00.000Z',
            updatedAt: '2026-03-10T12:00:00.000Z',
          }),
        ],
        totalCount: 1,
        overallCount: 5,
        page: 2,
        pageSize: 25,
        totalPages: 5,
      });
      expect(requestMock).toHaveBeenCalledWith(
        expect.anything(),
        {
          input: {
            page: 2,
            pageSize: 25,
            search: 'Pleey',
          },
        },
        undefined,
      );
    });

    it('maps transport failures to translated organization error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('organization.errors.loadFailed'),
      });
      const repository = createRepository(client);

      // Act + Assert
      await expect(repository.getMyOrganizations()).rejects.toThrow(
        OrganizationErrorCode.LOAD_FAILED,
      );
    });
  });

  describe('getOrganizationDashboard()', () => {
    it('returns normalized organization dashboard stats', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          organizationDashboard: {
            organization: {
              id: parseOrganizationId(9),
              name: 'Pleey Org',
              description: 'Main workspace',
            },
            stats: {
              totalGames: 14,
              totalMembers: 22,
              totalProjects: 5,
            },
          },
        },
      });
      const repository = createRepository(client);

      // Act
      const dashboard = await repository.getOrganizationDashboard(parseOrganizationId(9));

      // Assert
      expect(dashboard).toEqual(
        organizationFixtureFactory.createOrganizationDashboard({
          organization: {
            id: parseOrganizationId(9),
            name: 'Pleey Org',
            description: 'Main workspace',
          },
          stats: {
            totalGames: 14,
            totalMembers: 22,
            totalProjects: 5,
          },
        }),
      );
    });
  });

  describe('createOrganization()', () => {
    it('returns the created organization with normalized role', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          createOrganization: {
            id: parseOrganizationId(12),
            name: 'New Org',
            description: 'A brand new org',
            createdAt: '2026-03-15T10:00:00.000Z',
            updatedAt: '2026-03-15T10:00:00.000Z',
            role: 'OWNER',
          },
        },
      });
      const repository = createRepository(client);

      // Act
      const organization = await repository.createOrganization({
        name: 'New Org',
        description: 'A brand new org',
      });

      // Assert
      expect(organization).toEqual({
        id: parseOrganizationId(12),
        name: 'New Org',
        description: 'A brand new org',
        createdAt: '2026-03-15T10:00:00.000Z',
        updatedAt: '2026-03-15T10:00:00.000Z',
        role: OrganizationRole.OWNER,
      });
    });

    it('maps transport failures to translated create error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('organization.errors.createFailed'),
      });
      const repository = createRepository(client);

      // Act + Assert
      await expect(
        repository.createOrganization({ name: 'Fail', description: null }),
      ).rejects.toThrow(OrganizationErrorCode.CREATE_FAILED);
    });
  });

  describe('getOrganizationMembers()', () => {
    it('returns a paginated organization member result', async () => {
      // Arrange
      const { client, requestMock } = new GraphqlClientMockFactory().create({
        requestResult: {
          organizationMembers: {
            items: [
              {
                id: parseOrganizationMemberId(18),
                organizationId: parseOrganizationId(9),
                userId: parseUserId(42),
                username: 'captain',
                role: 'MANAGER',
                joinedAt: '2026-03-20T10:00:00.000Z',
              },
            ],
            totalCount: 1,
            overallCount: 4,
            page: 2,
            pageSize: 25,
            totalPages: 4,
          },
        },
      });
      const repository = createRepository(client);

      // Act
      const members = await repository.getOrganizationMembers({
        organizationId: parseOrganizationId(9),
        page: 2,
        pageSize: 25,
      });

      // Assert
      expect(members).toEqual({
        items: [
          {
            id: parseOrganizationMemberId(18),
            joinedAt: '2026-03-20T10:00:00.000Z',
            organizationId: parseOrganizationId(9),
            role: OrganizationRole.MANAGER,
            userId: parseUserId(42),
            username: 'captain',
          },
        ],
        totalCount: 1,
        overallCount: 4,
        page: 2,
        pageSize: 25,
        totalPages: 4,
      });
      expect(requestMock).toHaveBeenCalledWith(
        expect.anything(),
        {
          input: {
            organizationId: parseOrganizationId(9),
            page: 2,
            pageSize: 25,
          },
        },
        undefined,
      );
    });

    it('forwards optional member search to the GraphQL query', async () => {
      const { client, requestMock } = new GraphqlClientMockFactory().create({
        requestResult: {
          organizationMembers: {
            items: [],
            totalCount: 0,
            overallCount: 0,
            page: 1,
            pageSize: 25,
            totalPages: 1,
          },
        },
      });
      const repository = createRepository(client);

      await repository.getOrganizationMembers({
        organizationId: parseOrganizationId(9),
        page: 1,
        pageSize: 25,
        search: 'captain',
      });

      expect(requestMock).toHaveBeenCalledWith(
        expect.anything(),
        {
          input: {
            organizationId: parseOrganizationId(9),
            page: 1,
            pageSize: 25,
            search: 'captain',
          },
        },
        undefined,
      );
    });
  });

  describe('addOrganizationMember()', () => {
    it('creates a member and returns normalized data', async () => {
      // Arrange
      const { client, requestMock } = new GraphqlClientMockFactory().create({
        requestResult: {
          addOrganizationMember: {
            id: parseOrganizationMemberId(21),
            organizationId: parseOrganizationId(9),
            userId: parseUserId(43),
            username: 'captain',
            role: 'MEMBER',
            joinedAt: '2026-03-21T10:00:00.000Z',
          },
        },
      });
      const repository = createRepository(client);

      // Act
      const member = await repository.addOrganizationMember({
        organizationId: parseOrganizationId(9),
        role: OrganizationRole.MEMBER,
        usernameOrEmail: 'captain@pleey.io',
      });

      // Assert
      expect(member).toEqual({
        id: parseOrganizationMemberId(21),
        joinedAt: '2026-03-21T10:00:00.000Z',
        organizationId: parseOrganizationId(9),
        role: OrganizationRole.MEMBER,
        userId: parseUserId(43),
        username: 'captain',
      });
      expect(requestMock).toHaveBeenCalledWith(
        expect.anything(),
        {
          input: {
            role: 'MEMBER',
            usernameOrEmail: 'captain@pleey.io',
          },
          organizationId: parseOrganizationId(9),
        },
        undefined,
      );
    });

    it('maps transport failures to translated member add error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('organization.errors.memberAddFailed'),
      });
      const repository = createRepository(client);

      // Act + Assert
      await expect(
        repository.addOrganizationMember({
          organizationId: parseOrganizationId(9),
          role: OrganizationRole.MEMBER,
          usernameOrEmail: 'captain@pleey.io',
        }),
      ).rejects.toThrow(OrganizationErrorCode.MEMBER_ADD_FAILED);
    });
  });

  describe('removeOrganizationMember()', () => {
    it('removes a member by id', async () => {
      // Arrange
      const { client, requestMock } = new GraphqlClientMockFactory().create({
        requestResult: { removeOrganizationMember: true },
      });
      const repository = createRepository(client);

      // Act
      await repository.removeOrganizationMember({
        memberId: parseOrganizationMemberId(21),
      });

      // Assert
      expect(requestMock).toHaveBeenCalledWith(
        expect.anything(),
        {
          memberId: parseOrganizationMemberId(21),
        },
        undefined,
      );
    });

    it('maps transport failures to translated member remove error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('organization.errors.memberRemoveFailed'),
      });
      const repository = createRepository(client);

      // Act + Assert
      await expect(
        repository.removeOrganizationMember({ memberId: parseOrganizationMemberId(21) }),
      ).rejects.toThrow(OrganizationErrorCode.MEMBER_REMOVE_FAILED);
    });
  });

  describe('updateOrganizationMemberRole()', () => {
    it('updates a member role and returns normalized data', async () => {
      // Arrange
      const { client, requestMock } = new GraphqlClientMockFactory().create({
        requestResult: {
          updateOrganizationMemberRole: {
            id: parseOrganizationMemberId(21),
            organizationId: parseOrganizationId(9),
            userId: parseUserId(43),
            username: 'captain',
            role: 'MANAGER',
            joinedAt: '2026-03-21T10:00:00.000Z',
          },
        },
      });
      const repository = createRepository(client);

      // Act
      const member = await repository.updateOrganizationMemberRole({
        memberId: parseOrganizationMemberId(21),
        role: OrganizationRole.MANAGER,
      });

      // Assert
      expect(member).toEqual({
        id: parseOrganizationMemberId(21),
        joinedAt: '2026-03-21T10:00:00.000Z',
        organizationId: parseOrganizationId(9),
        role: OrganizationRole.MANAGER,
        userId: parseUserId(43),
        username: 'captain',
      });
      expect(requestMock).toHaveBeenCalledWith(
        expect.anything(),
        {
          input: {
            role: 'MANAGER',
          },
          memberId: parseOrganizationMemberId(21),
        },
        undefined,
      );
    });

    it('maps transport failures to translated member role update error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('organization.errors.memberRoleUpdateFailed'),
      });
      const repository = createRepository(client);

      // Act + Assert
      await expect(
        repository.updateOrganizationMemberRole({
          memberId: parseOrganizationMemberId(21),
          role: OrganizationRole.MANAGER,
        }),
      ).rejects.toThrow(OrganizationErrorCode.MEMBER_ROLE_UPDATE_FAILED);
    });
  });
});
