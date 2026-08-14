import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationFixtureFactory } from '../../../../../../test-utils/fixtures/organization-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { DashboardMetricsStrip } from './dashboard-metrics-strip';

const organizationFixtureFactory = new OrganizationFixtureFactory();

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('DashboardMetricsStrip', () => {
  it('renders empty state when dashboard is null', () => {
    // Arrange + Act
    renderWithUiProvider(<DashboardMetricsStrip dashboard={null} />);

    // Assert
    expect(screen.getByText('dashboard.stats.empty')).toBeInTheDocument();
  });

  it('renders all metric cells when dashboard is provided', () => {
    // Arrange
    const dashboard = organizationFixtureFactory.createOrganizationDashboard({
      organization: { id: 1, name: 'Test Org', description: null },
      stats: {
        totalGames: 12,
        totalProjects: 3,
        totalMembers: 7,
      },
    });

    // Act
    renderWithUiProvider(<DashboardMetricsStrip dashboard={dashboard} />);

    // Assert
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders the metrics strip as a labeled region', () => {
    // Arrange
    const dashboard = organizationFixtureFactory.createOrganizationDashboard({
      organization: { id: 1, name: 'Test Org', description: null },
      stats: {
        totalGames: 0,
        totalProjects: 0,
        totalMembers: 0,
      },
    });

    // Act
    renderWithUiProvider(<DashboardMetricsStrip dashboard={dashboard} />);

    // Assert
    expect(screen.getByRole('region', { name: 'dashboard.stats.title' })).toBeInTheDocument();
  });
});
