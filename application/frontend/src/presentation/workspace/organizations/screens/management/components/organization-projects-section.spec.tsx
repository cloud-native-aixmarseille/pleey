import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationActionDisabledReason } from '../../../../../../domains/organization/value-objects/organization-permissions';
import { ProjectFixtureFactory } from '../../../../../../test-utils/fixtures/project-fixture-factory';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { OrganizationProjectsSection } from './organization-projects-section';

const projectFixtureFactory = new ProjectFixtureFactory();
const pagination = {
  currentPage: 1,
  label: 'Project pages',
  nextLabel: 'Next projects',
  onPageChange: vi.fn(),
  pageOfLabel: 'Page',
  previousLabel: 'Previous projects',
  totalPages: 1,
};

function ControlledOrganizationProjectsSection({
  onProjectSearchChange,
  ...props
}: Omit<ComponentProps<typeof OrganizationProjectsSection>, 'projectSearchValue'>) {
  const [projectSearchValue, setProjectSearchValue] = useState('');

  return (
    <OrganizationProjectsSection
      {...props}
      onProjectSearchChange={(value) => {
        setProjectSearchValue(value);
        onProjectSearchChange(value);
      }}
      projectSearchValue={projectSearchValue}
    />
  );
}

describe('OrganizationProjectsSection', () => {
  it('renders the section content and delegates create/edit/remove actions', async () => {
    // Arrange
    const user = userEvent.setup();
    const project = projectFixtureFactory.createProject({
      id: 11,
      name: 'Main event',
      description: 'Primary workspace',
      organizationId: 5,
      createdAt: '2026-04-02T10:00:00.000Z',
    });
    const onCreateProject = vi.fn();
    const onEditProject = vi.fn();
    const onRemoveProject = vi.fn();
    const onProjectSearchChange = vi.fn();

    // Act
    renderWithProviders(
      <ControlledOrganizationProjectsSection
        actionErrorMessage="Unable to update project"
        createPermission={{ allowed: true, reason: null }}
        createButtonLabel="Create project"
        eyebrow="Projects"
        onCreateProject={onCreateProject}
        onEditProject={onEditProject}
        onProjectSearchChange={onProjectSearchChange}
        onRemoveProject={onRemoveProject}
        pagination={pagination}
        projects={[
          project,
          {
            ...project,
            id: projectFixtureFactory.createProject({ id: 12 }).id,
            name: 'Backup event',
          },
        ]}
        projectSearchLabel="Search projects"
        projectSearchPlaceholder="Search projects"
        searchDisabled={false}
        selectedProjectId={project.id}
        title="Organization projects"
      />,
    );

    // Assert
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Organization projects' })).toBeInTheDocument();
    expect(screen.getByText('Unable to update project')).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Search projects' }), 'Side');

    await user.click(screen.getByRole('button', { name: 'Create project' }));
    await user.click(screen.getAllByRole('button', { name: 'project.management.list.editButton' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'project.management.list.removeButton' })[0]);

    expect(onCreateProject).toHaveBeenCalledTimes(1);
    expect(onEditProject).toHaveBeenCalledWith(expect.objectContaining({ id: project.id }));
    expect(onRemoveProject).toHaveBeenCalledWith(expect.objectContaining({ id: project.id }));
    expect(onProjectSearchChange).toHaveBeenLastCalledWith('Side');
  });

  it('disables project creation when creation is not allowed', () => {
    // Arrange + Act
    renderWithProviders(
      <OrganizationProjectsSection
        actionErrorMessage={null}
        createPermission={{ allowed: false, reason: OrganizationActionDisabledReason.INSUFFICIENT_PERMISSIONS }}
        createButtonLabel="Create project"
        eyebrow="Projects"
        onCreateProject={vi.fn()}
        onEditProject={vi.fn()}
        onProjectSearchChange={vi.fn()}
        onRemoveProject={vi.fn()}
        pagination={pagination}
        projects={[]}
        projectSearchLabel="Search projects"
        projectSearchPlaceholder="Search projects"
        projectSearchValue=""
        searchDisabled
        selectedProjectId={null}
        title="Organization projects"
      />,
    );

    // Assert
    expect(screen.getByRole('button', { name: 'Create project' })).toBeDisabled();
  });
});
