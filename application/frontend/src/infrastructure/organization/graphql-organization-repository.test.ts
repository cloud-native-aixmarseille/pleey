import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { OrganizationRole } from '../../domains/organization/entities/organization';
import { OrganizationErrorCode } from '../../domains/organization/errors/organization-error-code';
import { GraphqlClientMockFactory } from '../../test-utils/factories/graphql-client-mock-factory';
import { GraphqlOrganizationRepository } from './graphql-organization.repository';

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
      const repository = new GraphqlOrganizationRepository(client);

      // Act
      const organizations = await repository.getMyOrganizations();

      // Assert
      expect(organizations).toEqual([
        {
          id: 9,
          name: 'Pleey Org',
          description: 'Main workspace',
          createdAt: '2026-03-10T12:00:00.000Z',
          updatedAt: '2026-03-10T12:00:00.000Z',
          role: OrganizationRole.OWNER,
        },
      ]);
    });

    it('maps transport failures to translated organization error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('organization.errors.loadFailed'),
      });
      const repository = new GraphqlOrganizationRepository(client);

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
              totalGameSessions: 31,
              activeGameSessions: 4,
              totalMembers: 22,
              totalProjects: 5,
            },
          },
        },
      });
      const repository = new GraphqlOrganizationRepository(client);

      // Act
      const dashboard = await repository.getOrganizationDashboard(9);

      // Assert
      expect(dashboard).toEqual({
        organization: {
          id: 9,
          name: 'Pleey Org',
          description: 'Main workspace',
        },
        stats: {
          totalGames: 14,
          totalGameSessions: 31,
          activeGameSessions: 4,
          totalMembers: 22,
          totalProjects: 5,
        },
      });
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
      const repository = new GraphqlOrganizationRepository(client);

      // Act
      const organization = await repository.createOrganization({
        name: 'New Org',
        description: 'A brand new org',
      });

      // Assert
      expect(organization).toEqual({
        id: 12,
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
      const repository = new GraphqlOrganizationRepository(client);

      // Act + Assert
      await expect(
        repository.createOrganization({ name: 'Fail', description: null }),
      ).rejects.toThrow(OrganizationErrorCode.CREATE_FAILED);
    });
  });
});
