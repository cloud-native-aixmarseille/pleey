import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationRole } from '../../../../../../domains/organization/entities/organization';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { DashboardWorkspaceSelectors } from './dashboard-workspace-selectors';

describe('DashboardWorkspaceSelectors', () => {
  it('renders both selectors and delegates organization/project changes and management actions', async () => {
    const user = userEvent.setup();
    const onOrganizationChange = vi.fn();
    const onProjectChange = vi.fn();
    const onManageOrganizations = vi.fn();
    const onManageProjects = vi.fn();

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
        organizationId={1}
        organizationLabel="Organization"
        organizationPlaceholder="Select organization"
        organizations={[
          {
            id: 1,
            name: 'Pleey Org',
            description: null,
            createdAt: '2026-04-02T10:00:00.000Z',
            updatedAt: '2026-04-02T10:00:00.000Z',
            role: OrganizationRole.OWNER,
          },
        ]}
        projectId={11}
        projectLabel="Project"
        projectPlaceholder="Select project"
        projects={[
          {
            id: 11,
            name: 'Main event',
            description: null,
            organizationId: 1,
            createdAt: '2026-04-02T10:00:00.000Z',
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText('Organization'), { target: { value: '1' } });
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
