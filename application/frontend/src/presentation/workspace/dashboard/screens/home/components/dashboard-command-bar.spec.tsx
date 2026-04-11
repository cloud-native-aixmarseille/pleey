import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationRole } from '../../../../../../domains/organization/entities/organization';
import { OrganizationFixtureFactory } from '../../../../../../test-utils/fixtures/organization-fixture-factory';
import { ProjectFixtureFactory } from '../../../../../../test-utils/fixtures/project-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { DashboardCommandBar } from './dashboard-command-bar';

const organizationFixtureFactory = new OrganizationFixtureFactory();
const projectFixtureFactory = new ProjectFixtureFactory();

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('DashboardCommandBar', () => {
  function renderDashboardCommandBar(
    overrides: Partial<React.ComponentProps<typeof DashboardCommandBar>> = {},
  ) {
    const onOrganizationChange = vi.fn();
    const onProjectChange = vi.fn();
    const onManageOrganizations = vi.fn();
    const onManageProjects = vi.fn();
    const arcadeOrganization = organizationFixtureFactory.createOrganization({
      id: 7,
      name: 'Arcade Org',
      description: 'Retro squad',
      createdAt: '2026-03-20T00:00:00.000Z',
      updatedAt: '2026-03-20T00:00:00.000Z',
      role: OrganizationRole.OWNER,
    });
    const secondaryOrganization = organizationFixtureFactory.createOrganization({
      id: 8,
      name: 'Quiz Masters',
      description: null,
      createdAt: '2026-03-21T00:00:00.000Z',
      updatedAt: '2026-03-21T00:00:00.000Z',
      role: OrganizationRole.MANAGER,
    });
    const flagshipProject = projectFixtureFactory.createProject({
      id: 12,
      name: 'Flagship',
      description: 'Main project',
      organizationId: arcadeOrganization.id,
      createdAt: '2026-03-20T00:00:00.000Z',
    });
    const sideQuestProject = projectFixtureFactory.createProject({
      id: 13,
      name: 'Side Quest',
      description: null,
      organizationId: arcadeOrganization.id,
      createdAt: '2026-03-21T00:00:00.000Z',
    });

    renderWithUiProvider(
      <DashboardCommandBar
        dashboard={{
          organization: organizationFixtureFactory.createOrganizationSummary({
            id: 7,
            name: 'Arcade Org',
            description: 'Retro squad',
          }),
          stats: {
            totalGames: 18,
            totalMembers: 12,
            totalProjects: 4,
          },
        }}
        isOrganizationsLoading={false}
        isWorkspaceLoading={false}
        onManageOrganizations={onManageOrganizations}
        onManageProjects={onManageProjects}
        onOrganizationChange={onOrganizationChange}
        onProjectChange={onProjectChange}
        organizationId={arcadeOrganization.id}
        organizations={[arcadeOrganization, secondaryOrganization]}
        projectId={flagshipProject.id}
        projects={[flagshipProject, sideQuestProject]}
        {...overrides}
      />,
    );

    return {
      onOrganizationChange,
      onProjectChange,
      onManageOrganizations,
      onManageProjects,
    };
  }

  it('renders workspace selectors and dashboard metrics', () => {
    renderDashboardCommandBar();

    expect(
      screen.getByRole('toolbar', { name: 'dashboard.workspace.sectionTitle' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('dashboard.workspace.organizationLabel')).toHaveValue('7');
    expect(screen.getByLabelText('dashboard.workspace.projectLabel')).toHaveValue('12');
    expect(screen.getByRole('region', { name: 'dashboard.stats.title' })).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('forwards selector changes', async () => {
    const user = userEvent.setup();
    const { onOrganizationChange, onProjectChange } = renderDashboardCommandBar();

    await user.selectOptions(screen.getByLabelText('dashboard.workspace.organizationLabel'), '8');
    await user.selectOptions(screen.getByLabelText('dashboard.workspace.projectLabel'), '13');

    expect(onOrganizationChange).toHaveBeenCalledWith('8');
    expect(onProjectChange).toHaveBeenCalledWith('13');
  });

  it('forwards manage button clicks', async () => {
    const user = userEvent.setup();
    const { onManageOrganizations, onManageProjects } = renderDashboardCommandBar();

    await user.click(
      screen.getByRole('button', { name: 'dashboard.workspace.manageOrganizations' }),
    );
    await user.click(screen.getByRole('button', { name: 'dashboard.workspace.manageProjects' }));

    expect(onManageOrganizations).toHaveBeenCalledOnce();
    expect(onManageProjects).toHaveBeenCalledOnce();
  });
});
