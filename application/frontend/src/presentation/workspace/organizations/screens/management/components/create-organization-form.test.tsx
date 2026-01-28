import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  type Organization,
  OrganizationRole,
} from '../../../../../../domains/organization/entities/organization';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { CreateOrganizationForm } from './create-organization-form';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const CREATED_ORG: Organization = {
  id: 42,
  name: 'New Org',
  description: 'A test org',
  createdAt: '2026-03-15T10:00:00.000Z',
  updatedAt: '2026-03-15T10:00:00.000Z',
  role: OrganizationRole.OWNER,
};

describe('CreateOrganizationForm', () => {
  it('renders the name and description fields', async () => {
    // Arrange + Act
    const user = userEvent.setup();

    renderWithProviders(<CreateOrganizationForm onSubmit={vi.fn()} onCreated={vi.fn()} />);

    await user.click(
      screen.getByRole('button', { name: 'organization.management.createOpenButton' }),
    );

    // Assert
    expect(
      await screen.findByLabelText(/organization\.management\.createNameLabel/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/organization\.management\.createDescriptionLabel/),
    ).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    // Arrange + Act
    renderWithProviders(<CreateOrganizationForm onSubmit={vi.fn()} onCreated={vi.fn()} />);

    // Assert
    expect(
      screen.getByRole('button', { name: 'organization.management.createOpenButton' }),
    ).toBeInTheDocument();
  });

  it('shows a validation error when submitting with an empty name', async () => {
    // Arrange
    const user = userEvent.setup();

    renderWithProviders(<CreateOrganizationForm onSubmit={vi.fn()} onCreated={vi.fn()} />);

    // Act
    await user.click(
      screen.getByRole('button', { name: 'organization.management.createOpenButton' }),
    );
    await screen.findByLabelText(/organization\.management\.createNameLabel/);
    await user.click(screen.getByRole('button', { name: 'organization.management.createSubmit' }));

    // Assert
    expect(
      screen.getByText('organization.management.createValidationNameRequired'),
    ).toBeInTheDocument();
  });

  it('calls onSubmit with the form data and onCreated after success', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(CREATED_ORG);
    const onCreated = vi.fn();

    renderWithProviders(<CreateOrganizationForm onSubmit={onSubmit} onCreated={onCreated} />);

    // Act
    await user.click(
      screen.getByRole('button', { name: 'organization.management.createOpenButton' }),
    );
    await screen.findByLabelText(/organization\.management\.createNameLabel/);
    await user.type(screen.getByLabelText(/organization\.management\.createNameLabel/), 'New Org');
    await user.type(
      screen.getByLabelText(/organization\.management\.createDescriptionLabel/),
      'A test org',
    );
    await user.click(screen.getByRole('button', { name: 'organization.management.createSubmit' }));

    // Assert
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'New Org',
        description: 'A test org',
      });
    });
    expect(onCreated).toHaveBeenCalledWith(CREATED_ORG);
  });

  it('shows an error message when submission fails', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('organization.errors.createFailed'));

    renderWithProviders(<CreateOrganizationForm onSubmit={onSubmit} onCreated={vi.fn()} />);

    // Act
    await user.click(
      screen.getByRole('button', { name: 'organization.management.createOpenButton' }),
    );
    await screen.findByLabelText(/organization\.management\.createNameLabel/);
    await user.type(screen.getByLabelText(/organization\.management\.createNameLabel/), 'Fail Org');
    await user.click(screen.getByRole('button', { name: 'organization.management.createSubmit' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('organization.errors.createFailed')).toBeInTheDocument();
    });
  });
});
