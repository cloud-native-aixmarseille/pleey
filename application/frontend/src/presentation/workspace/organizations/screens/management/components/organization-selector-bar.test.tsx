import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationRole } from '../../../../../../domains/organization/entities/organization';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { OrganizationSelectorBar } from './organization-selector-bar';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const ORGANIZATIONS = [
  {
    id: 1,
    name: 'Org Alpha',
    description: null,
    createdAt: '2026-03-12T00:00:00.000Z',
    updatedAt: '2026-03-12T00:00:00.000Z',
    role: OrganizationRole.OWNER,
  },
  {
    id: 2,
    name: 'Org Beta',
    description: 'Second org',
    createdAt: '2026-03-12T00:00:00.000Z',
    updatedAt: '2026-03-12T00:00:00.000Z',
    role: OrganizationRole.MEMBER,
  },
];

describe('OrganizationSelectorBar', () => {
  it('renders the toolbar', () => {
    // Arrange + Act
    renderWithProviders(
      <OrganizationSelectorBar
        organizations={[]}
        organizationId={null}
        selectedOrganizationName={null}
        isOrganizationsLoading={false}
        onOrganizationChange={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('renders the organization select with options', () => {
    // Arrange + Act
    renderWithProviders(
      <OrganizationSelectorBar
        organizations={ORGANIZATIONS}
        organizationId={1}
        selectedOrganizationName="Org Alpha"
        isOrganizationsLoading={false}
        onOrganizationChange={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByLabelText(/dashboard\.workspace\.organizationLabel/)).toBeInTheDocument();
    expect(screen.getAllByText('Org Alpha').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Org Beta')).toBeInTheDocument();
  });

  it('shows the selected organization name when ready', () => {
    // Arrange + Act
    renderWithProviders(
      <OrganizationSelectorBar
        organizations={ORGANIZATIONS}
        organizationId={1}
        selectedOrganizationName="Org Alpha"
        isOrganizationsLoading={false}
        onOrganizationChange={vi.fn()}
      />,
    );

    // Assert
    const readyLabels = screen.getAllByText('Org Alpha');
    expect(readyLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('forwards organization selection changes', async () => {
    // Arrange
    const user = userEvent.setup();
    const onOrganizationChange = vi.fn();

    renderWithProviders(
      <OrganizationSelectorBar
        organizations={ORGANIZATIONS}
        organizationId={null}
        selectedOrganizationName={null}
        isOrganizationsLoading={false}
        onOrganizationChange={onOrganizationChange}
      />,
    );

    // Act
    await user.selectOptions(screen.getByLabelText(/dashboard\.workspace\.organizationLabel/), '2');

    // Assert
    expect(onOrganizationChange).toHaveBeenCalledWith('2');
  });

  it('disables the select when loading', () => {
    // Arrange + Act
    renderWithProviders(
      <OrganizationSelectorBar
        organizations={[]}
        organizationId={null}
        selectedOrganizationName={null}
        isOrganizationsLoading={true}
        onOrganizationChange={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByLabelText(/dashboard\.workspace\.organizationLabel/)).toBeDisabled();
  });
});
