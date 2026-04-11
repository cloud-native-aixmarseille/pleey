import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationScreenFixtureFactory } from '../../../../../../test-utils/fixtures/organization-screen-fixture-factory';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { OrganizationProjectList } from './organization-project-list';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('OrganizationProjectList', () => {
  const fixtureFactory = new OrganizationScreenFixtureFactory();
  const onEditProject = vi.fn();
  const onRemoveProject = vi.fn();

  beforeEach(() => {
    onEditProject.mockReset();
    onRemoveProject.mockReset();
  });

  it('renders projects, selected state, fallback description, and row actions', async () => {
    const user = userEvent.setup();
    const flagshipProject = fixtureFactory.createProject({
      id: 11,
      name: 'Flagship Project',
      description: 'Core project',
    });
    const sideProject = fixtureFactory.createProject({
      id: 18,
      name: 'Side Project',
      description: null,
    });

    renderWithProviders(
      <OrganizationProjectList
        canRemoveProjects
        onEditProject={onEditProject}
        onRemoveProject={onRemoveProject}
        projects={[flagshipProject, sideProject]}
        selectedProjectId={sideProject.id}
      />,
    );

    expect(screen.getByText('Flagship Project')).toBeInTheDocument();
    expect(screen.getByText('Core project')).toBeInTheDocument();
    expect(screen.getByText('project.management.list.descriptionFallback')).toBeInTheDocument();

    const selectedArticle = screen.getByText('Side Project').closest('article');

    expect(selectedArticle).not.toBeNull();
    expect(
      within(selectedArticle as HTMLElement).getByText('project.management.list.selectedBadge'),
    ).toBeInTheDocument();

    await user.click(
      within(screen.getByText('Flagship Project').closest('article') as HTMLElement).getByRole(
        'button',
        { name: 'project.management.list.editButton' },
      ),
    );
    await user.click(
      within(selectedArticle as HTMLElement).getByRole('button', {
        name: 'project.management.list.removeButton',
      }),
    );

    expect(onEditProject).toHaveBeenCalledWith(flagshipProject);
    expect(onRemoveProject).toHaveBeenCalledWith(sideProject);
  });

  it('disables removal when the current user cannot remove projects', () => {
    const project = fixtureFactory.createProject();

    renderWithProviders(
      <OrganizationProjectList
        canRemoveProjects={false}
        onEditProject={onEditProject}
        onRemoveProject={onRemoveProject}
        projects={[project]}
        selectedProjectId={null}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'project.management.list.removeButton' }),
    ).toBeDisabled();
  });

  it('shows the empty state when there are no projects', () => {
    renderWithProviders(
      <OrganizationProjectList
        canRemoveProjects
        onEditProject={onEditProject}
        onRemoveProject={onRemoveProject}
        projects={[]}
        selectedProjectId={null}
      />,
    );

    expect(screen.getByText('project.management.list.empty')).toBeInTheDocument();
  });
});
