import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationManagementFacade } from '../../../../application/workspace/organizations/facades/organization-management.facade';
import { DashboardReadGatewayMockFactory } from '../../../../test-utils/factories/dashboard-read-gateway-mock-factory';
import { OrganizationRoutesFactory } from './organization-routes-factory';

describe('OrganizationRoutesFactory', () => {
  const dashboardReadGatewayMockFactory = new DashboardReadGatewayMockFactory();

  it('registers the organizations route', () => {
    const factory = new OrganizationRoutesFactory(
      dashboardReadGatewayMockFactory.create(),
      { loadOrganizationSelection: vi.fn(), loadOrganizationWorkspace: vi.fn() } as never,
      {
        createOrganization: vi.fn(),
        createProject: vi.fn(),
        updateProject: vi.fn(),
        deleteProject: vi.fn(),
      } as unknown as OrganizationManagementFacade,
    );

    const routes = factory.create();

    expect(routes).toHaveLength(1);
    expect(routes[0]?.path).toBe('workspace/organizations');
  });
});
