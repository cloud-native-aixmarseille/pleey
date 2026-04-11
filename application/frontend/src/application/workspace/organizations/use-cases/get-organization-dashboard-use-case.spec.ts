import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationFixtureFactory } from '../../../../test-utils/fixtures/organization-fixture-factory';
import { OrganizationIdentifier } from '../../shared/services/identifiers/organization-identifier';
import { GetOrganizationDashboardUseCase } from './get-organization-dashboard-use-case';

const organizationIdentifier = new OrganizationIdentifier();
const organizationFixtureFactory = new OrganizationFixtureFactory();

describe('GetOrganizationDashboardUseCase', () => {
  describe('execute()', () => {
    it('delegates the selected organization id to the repository', async () => {
      // Arrange
      const organizationRepository = {
        getOrganizationDashboard: vi.fn().mockResolvedValue(
          organizationFixtureFactory.createOrganizationDashboard({
            organization: { id: 4, name: 'North Hub', description: null },
            stats: {
              totalGames: 9,
              totalMembers: 8,
              totalProjects: 2,
            },
          }),
        ),
      };
      const useCase = new GetOrganizationDashboardUseCase(organizationRepository as never);

      // Act
      const result = await useCase.execute({
        organizationId: organizationIdentifier.parse(4),
      });

      // Assert
      expect(organizationRepository.getOrganizationDashboard).toHaveBeenCalledWith(
        organizationIdentifier.parse(4),
      );
      expect(result.organization.id).toBe(organizationIdentifier.parse(4));
    });
  });
});
