import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProjectFixtureFactory } from '../../../../../../test-utils/fixtures/project-fixture-factory';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { OrganizationProjectsSection } from './organization-projects-section';

const projectFixtureFactory = new ProjectFixtureFactory();

describe('OrganizationProjectsSection', () => {
  it('renders the section content and delegates create/edit/remove actions', async () => {
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

    renderWithProviders(
      <OrganizationProjectsSection
        actionErrorMessage="Unable to update project"
        canCreateProject
        createButtonLabel="Create project"
        eyebrow="Projects"
        onCreateProject={onCreateProject}
        onEditProject={onEditProject}
        onRemoveProject={onRemoveProject}
        projects={[
          project,
          {
            ...project,
            id: projectFixtureFactory.createProject({ id: 12 }).id,
            name: 'Backup event',
          },
        ]}
        selectedProjectId={project.id}
        title="Organization projects"
      />,
    );

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Organization projects' })).toBeInTheDocument();
    expect(screen.getByText('Unable to update project')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create project' }));
    await user.click(
      screen.getAllByRole('button', { name: 'project.management.list.editButton' })[0],
    );
    await user.click(
      screen.getAllByRole('button', { name: 'project.management.list.removeButton' })[0],
    );

    expect(onCreateProject).toHaveBeenCalledTimes(1);
    expect(onEditProject).toHaveBeenCalledWith(expect.objectContaining({ id: project.id }));
    expect(onRemoveProject).toHaveBeenCalledWith(expect.objectContaining({ id: project.id }));
  });

  it('disables project creation when creation is not allowed', () => {
    renderWithProviders(
      <OrganizationProjectsSection
        actionErrorMessage={null}
        canCreateProject={false}
        createButtonLabel="Create project"
        eyebrow="Projects"
        onCreateProject={vi.fn()}
        onEditProject={vi.fn()}
        onRemoveProject={vi.fn()}
        projects={[]}
        selectedProjectId={null}
        title="Organization projects"
      />,
    );

    expect(screen.getByRole('button', { name: 'Create project' })).toBeDisabled();
  });
});
