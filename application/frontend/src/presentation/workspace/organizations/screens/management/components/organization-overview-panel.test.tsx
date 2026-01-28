import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationRole } from '../../../../../../domains/organization/entities/organization';
import { OrganizationScreenFixtureFactory } from '../../../../../../test-utils/factories/organization-screen-fixture-factory';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { OrganizationOverviewPanel } from './organization-overview-panel';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('./organization-metrics-strip', () => ({
  OrganizationMetricsStrip: ({
    dashboard,
  }: {
    dashboard: { stats: { totalProjects: number } };
  }) => <div data-testid="organization-metrics-strip">metrics:{dashboard.stats.totalProjects}</div>,
}));

describe('OrganizationOverviewPanel', () => {
  const fixtureFactory = new OrganizationScreenFixtureFactory();
  const onOrganizationChange = vi.fn();

  beforeEach(() => {
    onOrganizationChange.mockReset();
  });

  it('renders selected organization details and forwards selector changes', async () => {
    const user = userEvent.setup();
    const firstOrganization = fixtureFactory.createOrganization({
      id: 3,
      name: 'Arcade Org',
      description: 'Main community hub',
      role: OrganizationRole.MANAGER,
      createdAt: '2026-03-12T00:00:00.000Z',
    });
    const secondOrganization = fixtureFactory.createOrganization({
      id: 5,
      name: 'Side Org',
      description: null,
      role: OrganizationRole.OWNER,
    });
    const dashboard = fixtureFactory.createOrganizationDashboard({
      stats: {
        totalGames: 0,
        totalGameSessions: 0,
        activeGameSessions: 0,
        totalMembers: 0,
        totalProjects: 4,
      },
    });

    renderWithProviders(
      <OrganizationOverviewPanel
        organizations={[firstOrganization, secondOrganization]}
        organizationId={firstOrganization.id}
        selectedOrganization={firstOrganization}
        dashboard={dashboard}
        isOrganizationsLoading={false}
        onOrganizationChange={onOrganizationChange}
      />,
    );

    const select = screen.getByRole('combobox', {
      name: 'dashboard.workspace.organizationLabel',
    });

    expect(select).toHaveValue(String(firstOrganization.id));
    expect(screen.getByText('Main community hub')).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
    expect(screen.getByText(/organization\.management\.detailCreated/)).toBeInTheDocument();
    expect(screen.getByTestId('organization-metrics-strip')).toHaveTextContent('metrics:4');

    await user.selectOptions(select, String(secondOrganization.id));

    expect(onOrganizationChange).toHaveBeenCalledWith(String(secondOrganization.id));
  });

  it('shows the empty state when no organization is selected', () => {
    renderWithProviders(
      <OrganizationOverviewPanel
        organizations={[]}
        organizationId={null}
        selectedOrganization={null}
        dashboard={null}
        isOrganizationsLoading={true}
        onOrganizationChange={onOrganizationChange}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'dashboard.workspace.organizationLabel' }),
    ).toHaveValue('');
    expect(
      screen.getByRole('combobox', { name: 'dashboard.workspace.organizationLabel' }),
    ).toBeDisabled();
    expect(screen.getByText('organization.management.detailEmpty')).toBeInTheDocument();
    expect(screen.queryByTestId('organization-metrics-strip')).not.toBeInTheDocument();
  });
});
