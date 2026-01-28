import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GetOrganizationDashboardUseCase } from './get-organization-dashboard-use-case';

describe('GetOrganizationDashboardUseCase', () => {
  describe('execute()', () => {
    it('delegates the selected organization id to the repository', async () => {
      // Arrange
      const organizationRepository = {
        getOrganizationDashboard: vi.fn().mockResolvedValue({
          organization: { id: 4, name: 'North Hub', description: null },
          stats: {
            totalGames: 9,
            totalGameSessions: 17,
            activeGameSessions: 3,
            totalMembers: 8,
            totalProjects: 2,
          },
        }),
      };
      const useCase = new GetOrganizationDashboardUseCase(organizationRepository as never);

      // Act
      const result = await useCase.execute({ organizationId: 4 });

      // Assert
      expect(organizationRepository.getOrganizationDashboard).toHaveBeenCalledWith(4);
      expect(result.organization.id).toBe(4);
    });
  });
});
