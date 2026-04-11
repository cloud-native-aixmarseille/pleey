import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationFixtureFactory } from '../../../../../../test-utils/fixtures/organization-fixture-factory';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { CreateOrganizationForm } from './create-organization-form';

const organizationFixtureFactory = new OrganizationFixtureFactory();

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const CREATED_ORG = organizationFixtureFactory.createCreatedOrganization();

describe('CreateOrganizationForm', () => {
  it('renders the name and description fields', async () => {
    // Arrange + Act
    const user = userEvent.setup();

    renderWithProviders(<CreateOrganizationForm onSubmit={vi.fn()} onCreated={vi.fn()} />);

    await user.click(
      screen.getByRole('button', { name: 'organization.management.create.openButton' }),
    );

    // Assert
    expect(
      await screen.findByLabelText(/organization\.management\.create\.fields\.name\.label/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/organization\.management\.create\.fields\.description\.label/),
    ).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    // Arrange + Act
    renderWithProviders(<CreateOrganizationForm onSubmit={vi.fn()} onCreated={vi.fn()} />);

    // Assert
    expect(
      screen.getByRole('button', { name: 'organization.management.create.openButton' }),
    ).toBeInTheDocument();
  });

  it('shows a validation error when submitting with an empty name', async () => {
    // Arrange
    const user = userEvent.setup();

    renderWithProviders(<CreateOrganizationForm onSubmit={vi.fn()} onCreated={vi.fn()} />);

    // Act
    await user.click(
      screen.getByRole('button', { name: 'organization.management.create.openButton' }),
    );
    await screen.findByLabelText(/organization\.management\.create\.fields\.name\.label/);
    await user.click(screen.getByRole('button', { name: 'organization.management.create.submit' }));

    // Assert
    expect(screen.getByText('organization.management.validation.nameRequired')).toBeInTheDocument();
  });

  it('calls onSubmit with the form data and onCreated after success', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(CREATED_ORG);
    const onCreated = vi.fn();

    renderWithProviders(<CreateOrganizationForm onSubmit={onSubmit} onCreated={onCreated} />);

    // Act
    await user.click(
      screen.getByRole('button', { name: 'organization.management.create.openButton' }),
    );
    await screen.findByLabelText(/organization\.management\.create\.fields\.name\.label/);
    await user.type(
      screen.getByLabelText(/organization\.management\.create\.fields\.name\.label/),
      'New Org',
    );
    await user.type(
      screen.getByLabelText(/organization\.management\.create\.fields\.description\.label/),
      'A test org',
    );
    await user.click(screen.getByRole('button', { name: 'organization.management.create.submit' }));

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
      screen.getByRole('button', { name: 'organization.management.create.openButton' }),
    );
    await screen.findByLabelText(/organization\.management\.create\.fields\.name\.label/);
    await user.type(
      screen.getByLabelText(/organization\.management\.create\.fields\.name\.label/),
      'Fail Org',
    );
    await user.click(screen.getByRole('button', { name: 'organization.management.create.submit' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('organization.errors.createFailed')).toBeInTheDocument();
    });
  });
});
