import { fireEvent, screen } from '@testing-library/react';
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
    const onProjectChange = vi.fn();
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
        isOrganizationsLoading={false}
        isWorkspaceLoading={false}
        manageOrganizationsLabel="Manage organizations"
        manageProjectsLabel="Manage projects"
        onManageOrganizations={onManageOrganizations}
        onManageProjects={onManageProjects}
        onOrganizationChange={onOrganizationChange}
        onProjectChange={onProjectChange}
        organizationId={organization.id}
        organizationLabel="Organization"
        organizationPlaceholder="Select organization"
        organizations={[organization]}
        projectId={project.id}
        projectLabel="Project"
        projectPlaceholder="Select project"
        projects={[project]}
      />,
    );

    fireEvent.change(screen.getByLabelText('Organization'), {
      target: { value: String(organization.id) },
    });
    fireEvent.change(screen.getByLabelText('Project'), { target: { value: '11' } });
    await user.click(screen.getByRole('button', { name: 'Manage organizations' }));
    await user.click(screen.getByRole('button', { name: 'Manage projects' }));

    expect(onOrganizationChange).toHaveBeenCalledWith('1');
    expect(onProjectChange).toHaveBeenCalledWith('11');
    expect(onManageOrganizations).toHaveBeenCalledTimes(1);
    expect(onManageProjects).toHaveBeenCalledTimes(1);
  });

  it('disables the project selector until an organization is selected', () => {
    renderWithUiProvider(
      <DashboardWorkspaceSelectors
        isOrganizationsLoading={false}
        isWorkspaceLoading={false}
        manageOrganizationsLabel="Manage organizations"
        manageProjectsLabel="Manage projects"
        onManageOrganizations={vi.fn()}
        onManageProjects={vi.fn()}
        onOrganizationChange={vi.fn()}
        onProjectChange={vi.fn()}
        organizationId={null}
        organizationLabel="Organization"
        organizationPlaceholder="Select organization"
        organizations={[]}
        projectId={null}
        projectLabel="Project"
        projectPlaceholder="Select project"
        projects={[]}
      />,
    );

    expect(screen.getByLabelText('Project')).toBeDisabled();
  });
});
