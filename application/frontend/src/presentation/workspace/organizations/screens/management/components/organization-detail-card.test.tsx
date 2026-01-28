import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  type Organization,
  OrganizationRole,
} from '../../../../../../domains/organization/entities/organization';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { OrganizationDetailCard } from './organization-detail-card';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const ORGANIZATION_FIXTURE: Organization = {
  id: 5,
  name: 'Pleey Org',
  description: 'Main workspace for the team',
  createdAt: '2026-03-10T12:00:00.000Z',
  updatedAt: '2026-03-10T12:00:00.000Z',
  role: OrganizationRole.OWNER,
};

describe('OrganizationDetailCard', () => {
  it('renders the organization name as a heading', () => {
    // Arrange + Act
    renderWithProviders(<OrganizationDetailCard organization={ORGANIZATION_FIXTURE} />);

    // Assert
    expect(screen.getByRole('heading', { name: 'Pleey Org' })).toBeInTheDocument();
  });

  it('renders the organization description', () => {
    // Arrange + Act
    renderWithProviders(<OrganizationDetailCard organization={ORGANIZATION_FIXTURE} />);

    // Assert
    expect(screen.getByText('Main workspace for the team')).toBeInTheDocument();
  });

  it('renders the organization role as a badge', () => {
    // Arrange + Act
    renderWithProviders(<OrganizationDetailCard organization={ORGANIZATION_FIXTURE} />);

    // Assert
    expect(screen.getByText('owner')).toBeInTheDocument();
  });

  it('renders the created date using the translation key', () => {
    // Arrange + Act
    renderWithProviders(<OrganizationDetailCard organization={ORGANIZATION_FIXTURE} />);

    // Assert
    expect(screen.getByText(/organization\.management\.detailCreated/)).toBeInTheDocument();
  });

  it('renders the no-description fallback when description is null', () => {
    // Arrange
    const organization: Organization = { ...ORGANIZATION_FIXTURE, description: null };

    // Act
    renderWithProviders(<OrganizationDetailCard organization={organization} />);

    // Assert
    expect(screen.getByText('organization.management.detailNoDescription')).toBeInTheDocument();
  });

  it('renders the no-role fallback when role is null', () => {
    // Arrange
    const organization: Organization = { ...ORGANIZATION_FIXTURE, role: null };

    // Act
    renderWithProviders(<OrganizationDetailCard organization={organization} />);

    // Assert
    expect(screen.getByText('organization.management.detailNoRole')).toBeInTheDocument();
  });

  it('renders an empty state when no organization is selected', () => {
    // Arrange + Act
    renderWithProviders(<OrganizationDetailCard organization={null} />);

    // Assert
    expect(screen.getByText('organization.management.detailEmpty')).toBeInTheDocument();
  });
});
