import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationFixtureFactory } from '../../../../../../test-utils/fixtures/organization-fixture-factory';
import { ProjectFixtureFactory } from '../../../../../../test-utils/fixtures/project-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { DashboardWorkspaceSelectors } from './dashboard-workspace-selectors';

const organizationFixtureFactory = new OrganizationFixtureFactory();
const projectFixtureFactory = new ProjectFixtureFactory();

describe('DashboardWorkspaceSelectors', () => {
  it('renders both selectors and delegates organization/project changes and management actions', async () => {
    const user = userEvent.setup();
    const onOrganizationChange = vi.fn();
    const onOrganizationSearchChange = vi.fn();
    const onProjectChange = vi.fn();
    const onProjectSearchChange = vi.fn();
    const onManageOrganizations = vi.fn();
    const onManageProjects = vi.fn();
    const organization = organizationFixtureFactory.createOrganization({
      id: 1,
      name: 'Pleey Org',
      createdAt: '2026-04-02T10:00:00.000Z',
      updatedAt: '2026-04-02T10:00:00.000Z',
    });
    const project = projectFixtureFactory.createProject({
      id: 11,
      name: 'Main event',
      description: null,
      organizationId: organization.id,
      createdAt: '2026-04-02T10:00:00.000Z',
    });

    renderWithUiProvider(
      <DashboardWorkspaceSelectors
        hasMoreOrganizations={false}
        hasMoreProjects={false}
        isOrganizationsLoading={false}
        isLoadingMoreOrganizations={false}
        isLoadingMoreProjects={false}
        isWorkspaceLoading={false}
        manageOrganizationsLabel="Manage organizations"
        manageProjectsLabel="Manage projects"
        onManageOrganizations={onManageOrganizations}
        onManageProjects={onManageProjects}
        onOrganizationChange={onOrganizationChange}
        onOrganizationSearchChange={onOrganizationSearchChange}
        onLoadMoreOrganizations={vi.fn()}
        onProjectChange={onProjectChange}
        onProjectSearchChange={onProjectSearchChange}
        onLoadMoreProjects={vi.fn()}
        organizationEmptyLabel="No organizations"
        organizationId={organization.id}
        organizationLabel="Organization"
        organizationLoadingLabel="Loading organizations"
        organizationNoResultsLabel="No organizations found"
        organizationPlaceholder="Select organization"
        organizationSearchLabel="Search organizations"
        organizationSearchPlaceholder="Search organizations"
        organizations={[organization]}
        selectedOrganizationLabel={organization.name}
        projectEmptyLabel="No projects"
        projectId={project.id}
        projectLabel="Project"
        projectLoadingLabel="Loading projects"
        projectNoResultsLabel="No projects found"
        projectPlaceholder="Select project"
        projectSearchLabel="Search projects"
        projectSearchPlaceholder="Search projects"
        projects={[project]}
        selectedProjectLabel={project.name}
      />,
    );

    await user.click(screen.getByLabelText('Organization'));
    await user.type(screen.getByLabelText('Search organizations'), 'Pleey');
    await user.keyboard('{Enter}');
    await user.click(screen.getByLabelText('Project'));
    await user.type(screen.getByLabelText('Search projects'), 'Main');
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('button', { name: 'Manage organizations' }));
    await user.click(screen.getByRole('button', { name: 'Manage projects' }));

    expect(onOrganizationChange).toHaveBeenCalledWith(organization.id);
    expect(onProjectChange).toHaveBeenCalledWith(project.id);
    expect(onOrganizationSearchChange).toHaveBeenCalledWith('Pleey');
    expect(onProjectSearchChange).toHaveBeenCalledWith('Main');
    expect(onManageOrganizations).toHaveBeenCalledTimes(1);
    expect(onManageProjects).toHaveBeenCalledTimes(1);
  });

  it('disables the project selector until an organization is selected', () => {
    renderWithUiProvider(
      <DashboardWorkspaceSelectors
        hasMoreOrganizations={false}
        hasMoreProjects={false}
        isOrganizationsLoading={false}
        isLoadingMoreOrganizations={false}
        isLoadingMoreProjects={false}
        isWorkspaceLoading={false}
        manageOrganizationsLabel="Manage organizations"
        manageProjectsLabel="Manage projects"
        onManageOrganizations={vi.fn()}
        onManageProjects={vi.fn()}
        onOrganizationChange={vi.fn()}
        onOrganizationSearchChange={vi.fn()}
        onLoadMoreOrganizations={vi.fn()}
        onProjectChange={vi.fn()}
        onProjectSearchChange={vi.fn()}
        onLoadMoreProjects={vi.fn()}
        organizationEmptyLabel="No organizations"
        organizationId={null}
        organizationLabel="Organization"
        organizationLoadingLabel="Loading organizations"
        organizationNoResultsLabel="No organizations found"
        organizationPlaceholder="Select organization"
        organizationSearchLabel="Search organizations"
        organizationSearchPlaceholder="Search organizations"
        organizations={[]}
        selectedOrganizationLabel={null}
        projectEmptyLabel="No projects"
        projectId={null}
        projectLabel="Project"
        projectLoadingLabel="Loading projects"
        projectNoResultsLabel="No projects found"
        projectPlaceholder="Select project"
        projectSearchLabel="Search projects"
        projectSearchPlaceholder="Search projects"
        projects={[]}
        selectedProjectLabel={null}
      />,
    );

    expect(screen.getByLabelText('Project')).toBeDisabled();
  });
});
