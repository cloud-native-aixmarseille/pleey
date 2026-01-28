import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { ProjectFormDialog } from './project-form-dialog';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('ProjectFormDialog', () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();
  const onSubmitted = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    onSubmit.mockReset();
    onSubmitted.mockReset();
  });

  function renderProjectFormDialog(
    overrides: Partial<React.ComponentProps<typeof ProjectFormDialog>> = {},
  ) {
    return renderWithProviders(
      <ProjectFormDialog
        isOpen
        mode="create"
        organizationName="Arcade Org"
        project={null}
        onClose={onClose}
        onSubmit={onSubmit}
        onSubmitted={onSubmitted}
        {...overrides}
      />,
    );
  }

  it('renders the create dialog title with the organization name', async () => {
    renderProjectFormDialog();

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText('organization.management.projectsCreateTitle (organization=Arcade Org)'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('organization.management.projectsNamePlaceholder'),
    ).toHaveValue('');
    expect(
      screen.getByPlaceholderText('organization.management.projectsDescriptionPlaceholder'),
    ).toHaveValue('');
  });

  it('prefills the form fields in edit mode', async () => {
    renderProjectFormDialog({
      mode: 'edit',
      organizationName: 'Arcade Org',
      project: {
        id: 11,
        name: 'Flagship Project',
        description: 'Core project',
        organizationId: 3,
        createdAt: '2026-03-12T00:00:00.000Z',
      },
    });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText('organization.management.projectsEditTitle (organization=Arcade Org)'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('organization.management.projectsNamePlaceholder'),
    ).toHaveValue('Flagship Project');
    expect(
      screen.getByPlaceholderText('organization.management.projectsDescriptionPlaceholder'),
    ).toHaveValue('Core project');
  });

  it('shows a validation error and blocks submit when name is blank', async () => {
    const user = userEvent.setup();

    renderProjectFormDialog();

    await user.click(
      await screen.findByRole('button', {
        name: 'organization.management.projectsCreateSubmit',
      }),
    );

    expect(
      screen.getByText('organization.management.projectsValidationNameRequired'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it('submits trimmed values and forwards the saved project', async () => {
    const user = userEvent.setup();
    const savedProject = {
      id: 101,
      name: 'New Project',
      description: 'Ready to launch',
      organizationId: 3,
      createdAt: '2026-03-12T00:00:00.000Z',
    };
    onSubmit.mockResolvedValue(savedProject);

    renderProjectFormDialog();

    await user.type(
      await screen.findByPlaceholderText('organization.management.projectsNamePlaceholder'),
      '  New Project  ',
    );
    await user.type(
      screen.getByPlaceholderText('organization.management.projectsDescriptionPlaceholder'),
      '  Ready to launch  ',
    );
    await user.click(
      screen.getByRole('button', {
        name: 'organization.management.projectsCreateSubmit',
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'Ready to launch',
      });
    });
    expect(onSubmitted).toHaveBeenCalledWith(savedProject);
  });

  it('shows the rejection message when submit fails', async () => {
    const user = userEvent.setup();
    onSubmit.mockRejectedValue(new Error('project.errors.updateFailed'));

    renderProjectFormDialog({
      mode: 'edit',
      project: {
        id: 11,
        name: 'Flagship Project',
        description: 'Core project',
        organizationId: 3,
        createdAt: '2026-03-12T00:00:00.000Z',
      },
    });

    await user.clear(
      await screen.findByPlaceholderText('organization.management.projectsNamePlaceholder'),
    );
    await user.type(
      screen.getByPlaceholderText('organization.management.projectsNamePlaceholder'),
      'Updated',
    );
    await user.click(
      screen.getByRole('button', {
        name: 'organization.management.projectsEditSubmit',
      }),
    );

    expect(await screen.findByText('project.errors.updateFailed')).toBeInTheDocument();
    expect(onSubmitted).not.toHaveBeenCalled();
  });
});
