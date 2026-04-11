import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProjectFixtureFactory } from '../../../../../../test-utils/fixtures/project-fixture-factory';
import { OrganizationIdentifierMockFactory } from '../../../../../../test-utils/mocks/organization-identifier-mock-factory';
import { ProjectIdentifierMockFactory } from '../../../../../../test-utils/mocks/project-identifier-mock-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { provideWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';
import { ProjectRemovalDialog } from './project-removal-dialog';

const projectFixtureFactory = new ProjectFixtureFactory();
const gameTypeParser = {
  parseOrNull: () => null,
};
const organizationIdentifier = new OrganizationIdentifierMockFactory().create();
const projectIdentifier = new ProjectIdentifierMockFactory().create();
const organizationFormFacade = {} as never;
const projectFormFacade = {} as never;

describe('ProjectRemovalDialog', () => {
  it('renders migration options and delegates selection and confirmation', async () => {
    const user = userEvent.setup();
    const onMigrationProjectChange = vi.fn();
    const onConfirm = vi.fn();

    renderWithUiProvider(
      provideWorkspaceDependencies(
        <ProjectRemovalDialog
          availableMigrationProjects={[
            projectFixtureFactory.createProject({
              id: 21,
              name: 'Target project',
              description: null,
              organizationId: 5,
              createdAt: '2026-04-02T10:00:00.000Z',
            }),
          ]}
          cancelLabel="Cancel"
          confirmDisabled={false}
          confirmLabel="Remove project"
          description="Move the games before deleting."
          isDeletingProject={false}
          isOpen
          label="Migration target"
          message="This action cannot be undone."
          migrationProjectId={null}
          onCancel={vi.fn()}
          onConfirm={onConfirm}
          onMigrationProjectChange={onMigrationProjectChange}
          placeholder="Select a project"
          title="Remove project"
        />,
        {
          gameTypeParser,
          organizationFormFacade,
          organizationIdentifier,
          projectFormFacade,
          projectIdentifier,
        },
      ),
    );

    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Migration target'), { target: { value: '21' } });
    await user.click(screen.getByRole('button', { name: 'Remove project' }));

    expect(onMigrationProjectChange).toHaveBeenCalledWith(projectIdentifier.parse(21));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('omits the migration selector when no migration targets are available', () => {
    renderWithUiProvider(
      provideWorkspaceDependencies(
        <ProjectRemovalDialog
          availableMigrationProjects={[]}
          cancelLabel="Cancel"
          confirmDisabled
          confirmLabel="Remove project"
          description="Move the games before deleting."
          isDeletingProject={false}
          isOpen
          label="Migration target"
          message="This action cannot be undone."
          migrationProjectId={null}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
          onMigrationProjectChange={vi.fn()}
          placeholder="Select a project"
          title="Remove project"
        />,
        {
          gameTypeParser,
          organizationFormFacade,
          organizationIdentifier,
          projectFormFacade,
          projectIdentifier,
        },
      ),
    );

    expect(screen.queryByLabelText('Migration target')).not.toBeInTheDocument();
  });
});
