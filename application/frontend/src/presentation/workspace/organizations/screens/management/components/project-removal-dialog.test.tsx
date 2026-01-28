import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { ProjectRemovalDialog } from './project-removal-dialog';

describe('ProjectRemovalDialog', () => {
  it('renders migration options and delegates selection and confirmation', async () => {
    const user = userEvent.setup();
    const onMigrationProjectChange = vi.fn();
    const onConfirm = vi.fn();

    renderWithUiProvider(
      <ProjectRemovalDialog
        availableMigrationProjects={[
          {
            id: 21,
            name: 'Target project',
            description: null,
            organizationId: 5,
            createdAt: '2026-04-02T10:00:00.000Z',
          },
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
    );

    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Migration target'), { target: { value: '21' } });
    await user.click(screen.getByRole('button', { name: 'Remove project' }));

    expect(onMigrationProjectChange).toHaveBeenCalledWith(21);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('omits the migration selector when no migration targets are available', () => {
    renderWithUiProvider(
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
    );

    expect(screen.queryByLabelText('Migration target')).not.toBeInTheDocument();
  });
});
