import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { DashboardMetricsStrip } from './dashboard-metrics-strip';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('DashboardMetricsStrip', () => {
  it('renders empty state when dashboard is null', () => {
    renderWithUiProvider(<DashboardMetricsStrip dashboard={null} />);

    expect(screen.getByText('dashboard.stats.empty')).toBeInTheDocument();
  });

  it('renders all metric cells when dashboard is provided', () => {
    const dashboard = {
      organization: { id: 1, name: 'Test Org', description: null },
      stats: {
        totalGames: 12,
        totalProjects: 3,
        totalMembers: 7,
        activeGameSessions: 2,
        totalGameSessions: 45,
      },
    };

    renderWithUiProvider(<DashboardMetricsStrip dashboard={dashboard} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('renders the metrics strip as a labeled region', () => {
    const dashboard = {
      organization: { id: 1, name: 'Test Org', description: null },
      stats: {
        totalGames: 0,
        totalProjects: 0,
        totalMembers: 0,
        activeGameSessions: 0,
        totalGameSessions: 0,
      },
    };

    renderWithUiProvider(<DashboardMetricsStrip dashboard={dashboard} />);

    expect(screen.getByRole('region', { name: 'dashboard.stats.title' })).toBeInTheDocument();
  });
});
