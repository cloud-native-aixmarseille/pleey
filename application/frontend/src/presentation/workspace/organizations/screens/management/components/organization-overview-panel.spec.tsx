import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationRole } from '../../../../../../domains/organization/entities/organization';
import { OrganizationFixtureFactory } from '../../../../../../test-utils/fixtures/organization-fixture-factory';
import { OrganizationScreenFixtureFactory } from '../../../../../../test-utils/fixtures/organization-screen-fixture-factory';
import { coerceUuidV7TestValue } from '../../../../../../test-utils/fixtures/uuid-v7-test-value';
import { OrganizationIdentifierMockFactory } from '../../../../../../test-utils/mocks/organization-identifier-mock-factory';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { OrganizationOverviewPanel } from './organization-overview-panel';

const organizationIdentifier = new OrganizationIdentifierMockFactory().create();
const parseOrganizationId = (value: number) =>
  organizationIdentifier.parse(coerceUuidV7TestValue(value));

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
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
  const organizationFixtureFactory = new OrganizationFixtureFactory();
  const onOrganizationChange = vi.fn();
  const onOrganizationSearchChange = vi.fn();

  beforeEach(() => {
    onOrganizationChange.mockReset();
    onOrganizationSearchChange.mockReset();
  });

  it('renders selected organization details and forwards selector changes', async () => {
    const user = userEvent.setup();
    const firstOrganization = organizationFixtureFactory.createOrganization({
      id: parseOrganizationId(3),
      name: 'Arcade Org',
      description: 'Main community hub',
      role: OrganizationRole.MANAGER,
      createdAt: '2026-03-12T00:00:00.000Z',
    });
    const secondOrganization = organizationFixtureFactory.createOrganization({
      id: parseOrganizationId(5),
      name: 'Side Org',
      description: null,
    });
    const dashboard = fixtureFactory.createOrganizationDashboard({
      stats: {
        totalGames: 0,
        totalMembers: 0,
        totalProjects: 4,
      },
    });

    renderWithProviders(
      <OrganizationOverviewPanel
        organizations={[firstOrganization, secondOrganization]}
        hasMoreOrganizations={false}
        organizationId={firstOrganization.id}
        organizationEmptyLabel="dashboard.workspace.organizationEmpty"
        organizationLoadingLabel="dashboard.workspace.organizationLoading"
        organizationNoResultsLabel="dashboard.workspace.organizationNoResults"
        organizationSearchLabel="dashboard.workspace.organizationSearchLabel"
        organizationSearchPlaceholder="dashboard.workspace.organizationSearchPlaceholder"
        selectedOrganization={firstOrganization}
        dashboard={dashboard}
        isOrganizationsLoading={false}
        isLoadingMoreOrganizations={false}
        onOrganizationChange={onOrganizationChange}
        onOrganizationSearchChange={onOrganizationSearchChange}
        onLoadMoreOrganizations={vi.fn()}
      />,
    );

    const toolbar = screen.getByRole('toolbar', {
      name: 'organization.management.header.title',
    });
    const [combobox] = within(toolbar).getAllByRole('button');

    expect(combobox).toHaveTextContent('Arcade Org');
    expect(screen.getByText('Main community hub')).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
    expect(screen.getByText(/organization\.management\.details\.created/)).toBeInTheDocument();
    expect(screen.getByTestId('organization-metrics-strip')).toHaveTextContent('metrics:4');

    await user.click(combobox);
    await user.type(screen.getByLabelText('dashboard.workspace.organizationSearchLabel'), 'Side');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onOrganizationChange).toHaveBeenCalledWith(String(secondOrganization.id));
    expect(onOrganizationSearchChange).toHaveBeenCalledWith('Side');
  });

  it('shows the empty state when no organization is selected', () => {
    renderWithProviders(
      <OrganizationOverviewPanel
        organizations={[]}
        hasMoreOrganizations={false}
        organizationId={null}
        organizationEmptyLabel="dashboard.workspace.organizationEmpty"
        organizationLoadingLabel="dashboard.workspace.organizationLoading"
        organizationNoResultsLabel="dashboard.workspace.organizationNoResults"
        organizationSearchLabel="dashboard.workspace.organizationSearchLabel"
        organizationSearchPlaceholder="dashboard.workspace.organizationSearchPlaceholder"
        selectedOrganization={null}
        dashboard={null}
        isOrganizationsLoading={true}
        isLoadingMoreOrganizations={false}
        onOrganizationChange={onOrganizationChange}
        onOrganizationSearchChange={onOrganizationSearchChange}
        onLoadMoreOrganizations={vi.fn()}
      />,
    );

    const toolbar = screen.getByRole('toolbar', {
      name: 'organization.management.header.title',
    });
    const [combobox] = within(toolbar).getAllByRole('button');

    expect(combobox).toHaveTextContent('dashboard.workspace.organizationPlaceholder');
    expect(combobox).toBeDisabled();
    expect(screen.getByText('organization.management.details.empty')).toBeInTheDocument();
    expect(screen.queryByTestId('organization-metrics-strip')).not.toBeInTheDocument();
  });
});
