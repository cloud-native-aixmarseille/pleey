import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { OrganizationMetricsStrip } from './organization-metrics-strip';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const DASHBOARD_FIXTURE: OrganizationDashboard = {
  organization: { id: 1, name: 'Org', description: null },
  stats: {
    totalGames: 12,
    totalGameSessions: 50,
    activeGameSessions: 3,
    totalMembers: 8,
    totalProjects: 4,
  },
};

describe('OrganizationMetricsStrip', () => {
  it('renders the empty message when dashboard is null', () => {
    // Arrange + Act
    renderWithProviders(<OrganizationMetricsStrip dashboard={null} />);

    // Assert
    expect(screen.getByText('organization.management.statsEmpty')).toBeInTheDocument();
  });

  it('renders all metric cells when dashboard is provided', () => {
    // Arrange + Act
    renderWithProviders(<OrganizationMetricsStrip dashboard={DASHBOARD_FIXTURE} />);

    // Assert
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders a labeled region', () => {
    // Arrange + Act
    renderWithProviders(<OrganizationMetricsStrip dashboard={DASHBOARD_FIXTURE} />);

    // Assert
    expect(
      screen.getByRole('region', { name: 'organization.management.statsTitle' }),
    ).toBeInTheDocument();
  });

  it('renders metric labels using translation keys', () => {
    // Arrange + Act
    renderWithProviders(<OrganizationMetricsStrip dashboard={DASHBOARD_FIXTURE} />);

    // Assert
    expect(screen.getByText('organization.management.statsTotalGames')).toBeInTheDocument();
    expect(screen.getByText('organization.management.statsTotalProjects')).toBeInTheDocument();
    expect(screen.getByText('organization.management.statsTotalMembers')).toBeInTheDocument();
    expect(screen.getByText('organization.management.statsActiveSessions')).toBeInTheDocument();
    expect(screen.getByText('organization.management.statsTotalSessions')).toBeInTheDocument();
  });
});
