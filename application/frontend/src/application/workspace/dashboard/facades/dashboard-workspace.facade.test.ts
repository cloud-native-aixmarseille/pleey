import { describe, expect, it, vi } from 'vitest';
import { DashboardHomeScreenFixtureFactory } from '../../../../test-utils/factories/dashboard-home-screen-fixture-factory';
import { WorkspaceSelectionPortMockFactory } from '../../../../test-utils/factories/workspace-selection-port-mock-factory';
import { DashboardWorkspaceFacade } from './dashboard-workspace.facade';

describe('DashboardWorkspaceFacade', () => {
  const dashboardHomeScreenFixtureFactory = new DashboardHomeScreenFixtureFactory();
  const workspaceSelectionPortMockFactory = new WorkspaceSelectionPortMockFactory();

  it('restores the persisted organization when it is still available', async () => {
    const organization = dashboardHomeScreenFixtureFactory.createOrganization({ id: 7 });
    const dashboardReadFacade = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
      loadOrganizations: vi.fn().mockResolvedValue([organization]),
    });
    const workspaceSelection = workspaceSelectionPortMockFactory.create(undefined, {
      organizationId: 7,
      projectId: null,
    });
    const facade = new DashboardWorkspaceFacade(dashboardReadFacade as never, workspaceSelection);

    await expect(facade.loadOrganizationSelection()).resolves.toEqual({
      organizations: [organization],
      organizationId: 7,
    });
    expect(workspaceSelection.setOrganizationId).toHaveBeenCalledWith(7);
  });

  it('falls back to the first organization when the persisted one is missing', async () => {
    const firstOrganization = dashboardHomeScreenFixtureFactory.createOrganization({ id: 3 });
    const secondOrganization = dashboardHomeScreenFixtureFactory.createOrganization({ id: 7 });
    const dashboardReadFacade = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
      loadOrganizations: vi.fn().mockResolvedValue([firstOrganization, secondOrganization]),
    });
    const workspaceSelection = workspaceSelectionPortMockFactory.create(undefined, {
      organizationId: 99,
      projectId: 11,
    });
    const facade = new DashboardWorkspaceFacade(dashboardReadFacade as never, workspaceSelection);

    await expect(facade.loadOrganizationSelection()).resolves.toEqual({
      organizations: [firstOrganization, secondOrganization],
      organizationId: 3,
    });
    expect(workspaceSelection.setOrganizationId).toHaveBeenCalledWith(3);
  });

  it('restores the persisted project for the selected organization', async () => {
    const organizationDashboard = dashboardHomeScreenFixtureFactory.createOrganizationDashboard();
    const firstProject = dashboardHomeScreenFixtureFactory.createProject({ id: 8 });
    const secondProject = dashboardHomeScreenFixtureFactory.createProject({ id: 13 });
    const dashboardReadFacade = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
      loadOrganizationDashboard: vi.fn().mockResolvedValue(organizationDashboard),
      loadProjectsByOrganization: vi.fn().mockResolvedValue([firstProject, secondProject]),
    });
    const workspaceSelection = workspaceSelectionPortMockFactory.create(undefined, {
      organizationId: 2,
      projectId: 13,
    });
    const facade = new DashboardWorkspaceFacade(dashboardReadFacade as never, workspaceSelection);

    await expect(facade.loadOrganizationWorkspace(2)).resolves.toEqual({
      organizationDashboard,
      projects: [firstProject, secondProject],
      projectId: 13,
    });
    expect(workspaceSelection.setProjectId).toHaveBeenCalledWith(13);
  });

  it('clears the project selection when no organization is selected', async () => {
    const dashboardReadFacade = dashboardHomeScreenFixtureFactory.createDashboardReadGateway();
    const workspaceSelection = workspaceSelectionPortMockFactory.create();
    const facade = new DashboardWorkspaceFacade(dashboardReadFacade as never, workspaceSelection);

    await expect(facade.loadOrganizationWorkspace(null)).resolves.toEqual({
      organizationDashboard: null,
      projects: [],
      projectId: null,
    });
    expect(workspaceSelection.setProjectId).toHaveBeenCalledWith(null);
    expect(dashboardReadFacade.loadOrganizationDashboard).not.toHaveBeenCalled();
  });
});
