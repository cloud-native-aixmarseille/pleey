import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationErrorCode } from '../../domains/organization/errors/organization-error-code';
import { OrganizationFixtureFactory } from '../../test-utils/fixtures/organization-fixture-factory';
import { GraphqlClientMockFactory } from '../../test-utils/mocks/graphql-client-mock-factory';
import { GraphqlOrganizationRepository } from './graphql-organization.repository';

const organizationIdentifier = new OrganizationIdentifier();
const organizationFixtureFactory = new OrganizationFixtureFactory();

describe('GraphqlOrganizationRepository', () => {
  describe('getMyOrganizations()', () => {
    it('returns normalized organizations', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          myOrganizations: {
            organizations: [
              {
                id: 9,
                name: 'Pleey Org',
                description: 'Main workspace',
                createdAt: '2026-03-10T12:00:00.000Z',
                updatedAt: '2026-03-10T12:00:00.000Z',
                role: 'OWNER',
              },
            ],
          },
        },
      });
      const repository = new GraphqlOrganizationRepository(client, organizationIdentifier);

      // Act
      const organizations = await repository.getMyOrganizations();

      // Assert
      expect(organizations).toEqual([
        organizationFixtureFactory.createOrganization({
          id: organizationIdentifier.parse(9),
          name: 'Pleey Org',
          description: 'Main workspace',
          createdAt: '2026-03-10T12:00:00.000Z',
          updatedAt: '2026-03-10T12:00:00.000Z',
        }),
      ]);
    });

    it('maps transport failures to translated organization error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('organization.errors.loadFailed'),
      });
      const repository = new GraphqlOrganizationRepository(client, organizationIdentifier);

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
              id: 9,
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
      const repository = new GraphqlOrganizationRepository(client, organizationIdentifier);

      // Act
      const dashboard = await repository.getOrganizationDashboard(organizationIdentifier.parse(9));

      // Assert
      expect(dashboard).toEqual(
        organizationFixtureFactory.createOrganizationDashboard({
          organization: {
            id: 9,
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
            id: 12,
            name: 'New Org',
            description: 'A brand new org',
            createdAt: '2026-03-15T10:00:00.000Z',
            updatedAt: '2026-03-15T10:00:00.000Z',
            role: 'OWNER',
          },
        },
      });
      const repository = new GraphqlOrganizationRepository(client, organizationIdentifier);

      // Act
      const organization = await repository.createOrganization({
        name: 'New Org',
        description: 'A brand new org',
      });

      // Assert
      expect(organization).toEqual(
        organizationFixtureFactory.createCreatedOrganization({
          id: organizationIdentifier.parse(12),
          description: 'A brand new org',
        }),
      );
    });

    it('maps transport failures to translated create error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('organization.errors.createFailed'),
      });
      const repository = new GraphqlOrganizationRepository(client, organizationIdentifier);

      // Act + Assert
      await expect(
        repository.createOrganization({ name: 'Fail', description: null }),
      ).rejects.toThrow(OrganizationErrorCode.CREATE_FAILED);
    });
  });
});
