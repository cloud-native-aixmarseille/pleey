import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DashboardWorkspaceGateway } from '../../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import { OrganizationScreenFixtureFactory } from '../../../../../test-utils/factories/organization-screen-fixture-factory';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { OrganizationScreen } from './organization-screen';

const organizationScreenFixtureFactory = new OrganizationScreenFixtureFactory();

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

function createPendingPromise<T>(): Promise<T> {
  return new Promise(() => undefined);
}

interface RenderOrganizationScreenOptions {
  readonly deferWorkspaceLoad?: boolean;
}

function renderOrganizationScreen(
  overrides: Partial<
    ReturnType<OrganizationScreenFixtureFactory['createDashboardReadGateway']>
  > = {},
  dashboardWorkspaceOverrides: Partial<DashboardWorkspaceGateway> = {},
  options: RenderOrganizationScreenOptions = {},
) {
  const actions = organizationScreenFixtureFactory.createActions();
  const shouldDeferWorkspaceLoad = options.deferWorkspaceLoad ?? false;
  const dashboardWorkspace: DashboardWorkspaceGateway = {
    loadOrganizationSelection: shouldDeferWorkspaceLoad
      ? vi
          .fn<DashboardWorkspaceGateway['loadOrganizationSelection']>()
          .mockImplementation(() => createPendingPromise())
      : vi.fn().mockResolvedValue({
          organizations: [organizationScreenFixtureFactory.createOrganization()],
          organizationId: 3,
        }),
    loadOrganizationWorkspace: shouldDeferWorkspaceLoad
      ? vi
          .fn<DashboardWorkspaceGateway['loadOrganizationWorkspace']>()
          .mockImplementation(() => createPendingPromise())
      : vi.fn().mockResolvedValue({
          organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
          projects: [],
          projectId: null,
        }),
    setOrganizationSelection: vi.fn(),
    setProjectSelection: vi.fn(),
    ...overrides,
    ...dashboardWorkspaceOverrides,
  };

  return {
    ...actions,
    ...renderWithProviders(
      <OrganizationScreen
        dashboardWorkspace={dashboardWorkspace}
        createOrganization={actions.createOrganization}
        createProject={actions.createProject}
        updateProject={actions.updateProject}
        deleteProject={actions.deleteProject}
      />,
    ),
  };
}

describe('OrganizationScreen', () => {
  describe('render()', () => {
    it('renders the page header with the organization management title', () => {
      // Arrange + Act
      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: true });

      // Assert
      expect(
        screen.getByRole('heading', { name: 'organization.management.title' }),
      ).toBeInTheDocument();
    });

    it('renders the page header kicker', () => {
      // Arrange + Act
      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: true });

      // Assert
      expect(screen.getByText('organization.management.eyebrow')).toBeInTheDocument();
    });

    it('renders the organization selector toolbar', () => {
      // Arrange + Act
      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: true });

      // Assert
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      expect(screen.getByLabelText(/dashboard\.workspace\.organizationLabel/)).toBeInTheDocument();
    });

    it('renders the overview empty state when no organization is selected', () => {
      // Arrange + Act
      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: true });

      // Assert
      expect(screen.getByText('organization.management.detailEmpty')).toBeInTheDocument();
    });

    it('renders the create organization action in the page header', () => {
      // Arrange + Act
      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: true });

      // Assert
      expect(
        screen.getByRole('button', { name: 'organization.management.createOpenButton' }),
      ).toBeInTheDocument();
    });

    it('renders the project management section', () => {
      // Arrange + Act
      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: true });

      // Assert
      expect(
        screen.getByRole('heading', { name: 'organization.management.projectsTitle' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'organization.management.projectsCreateButton' }),
      ).toBeInTheDocument();
      expect(screen.getByText('organization.management.projectsEmpty')).toBeInTheDocument();
    });

    it('disables project removal when the organization only has one project', async () => {
      const user = userEvent.setup();
      const deleteProject = vi.fn().mockResolvedValue(undefined);

      renderOrganizationScreen(
        {
          loadOrganizations: vi
            .fn()
            .mockResolvedValue([organizationScreenFixtureFactory.createOrganization()]),
          loadOrganizationDashboard: vi.fn().mockResolvedValue(
            organizationScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 2,
                totalGameSessions: 4,
                activeGameSessions: 1,
                totalMembers: 3,
                totalProjects: 1,
              },
            }),
          ),
          loadProjectsByOrganization: vi
            .fn()
            .mockResolvedValue([organizationScreenFixtureFactory.createProject()]),
        },
        {
          loadOrganizationWorkspace: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 2,
                totalGameSessions: 4,
                activeGameSessions: 1,
                totalMembers: 3,
                totalProjects: 1,
              },
            }),
            projects: [organizationScreenFixtureFactory.createProject()],
            projectId: 11,
          }),
        },
      ).deleteProject.mockImplementation(deleteProject);

      const removeButton = await screen.findByRole('button', {
        name: 'organization.management.projectsRemoveButton',
      });

      expect(removeButton).toBeDisabled();

      await user.click(removeButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(deleteProject).not.toHaveBeenCalled();
    });

    it('renders organization details without duplicating the selected organization name', async () => {
      // Arrange
      renderOrganizationScreen(
        {
          loadOrganizations: vi
            .fn()
            .mockResolvedValue([
              organizationScreenFixtureFactory.createOrganization({ description: 'The best org' }),
            ]),
        },
        {
          loadOrganizationSelection: vi.fn().mockResolvedValue({
            organizations: [
              organizationScreenFixtureFactory.createOrganization({ description: 'The best org' }),
            ],
            organizationId: 3,
          }),
          loadOrganizationWorkspace: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard({
              organization: {
                id: 3,
                name: 'Active Org',
                description: 'The best org',
              },
              stats: {
                totalGames: 5,
                totalGameSessions: 10,
                activeGameSessions: 2,
                totalMembers: 8,
                totalProjects: 3,
              },
            }),
            projects: [],
            projectId: null,
          }),
        },
      );

      // Assert
      expect(await screen.findByLabelText(/dashboard\.workspace\.organizationLabel/)).toHaveValue(
        '3',
      );
      expect(screen.queryByRole('heading', { name: 'Active Org' })).not.toBeInTheDocument();
      expect(screen.getByText('The best org')).toBeInTheDocument();
      expect(screen.getByText('owner')).toBeInTheDocument();
    });

    it('renders metrics when an organization dashboard loads', async () => {
      // Arrange
      renderOrganizationScreen(
        {
          loadOrganizations: vi
            .fn()
            .mockResolvedValue([organizationScreenFixtureFactory.createOrganization()]),
        },
        {
          loadOrganizationWorkspace: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 5,
                totalGameSessions: 10,
                activeGameSessions: 2,
                totalMembers: 8,
                totalProjects: 3,
              },
            }),
            projects: [],
            projectId: null,
          }),
        },
      );

      // Assert
      expect(
        await screen.findByRole('region', { name: 'organization.management.statsTitle' }),
      ).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders organization projects and highlights the selected project', async () => {
      // Arrange
      renderOrganizationScreen(
        {},
        {
          loadOrganizationWorkspace: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 5,
                totalGameSessions: 10,
                activeGameSessions: 2,
                totalMembers: 8,
                totalProjects: 2,
              },
            }),
            projects: [
              organizationScreenFixtureFactory.createProject(),
              organizationScreenFixtureFactory.createProject({
                id: 12,
                name: 'Side Project',
                description: null,
              }),
            ],
            projectId: 11,
          }),
        },
      );

      // Assert
      expect(await screen.findByText('Flagship Project')).toBeInTheDocument();
      expect(screen.getByText('Side Project')).toBeInTheDocument();
      expect(screen.getByText('organization.management.projectsSelectedBadge')).toBeInTheDocument();
      expect(
        screen.getByText('organization.management.projectsDescriptionFallback'),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: 'organization.management.projectsEditButton' }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole('button', { name: 'organization.management.projectsRemoveButton' }),
      ).toHaveLength(2);
    });

    it('opens the create project dialog from the projects section', async () => {
      const user = userEvent.setup();

      renderOrganizationScreen(
        {
          loadOrganizations: vi
            .fn()
            .mockResolvedValue([organizationScreenFixtureFactory.createOrganization()]),
        },
        {
          loadOrganizationWorkspace: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
            projects: [],
            projectId: null,
          }),
        },
      );

      await user.click(
        await screen.findByRole('button', {
          name: 'organization.management.projectsCreateButton',
        }),
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/organization\.management\.projectsCreateTitle/)).toBeInTheDocument();
    });

    it('opens the edit project dialog for a listed project', async () => {
      const user = userEvent.setup();
      renderOrganizationScreen(
        {},
        {
          loadOrganizationWorkspace: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
            projects: [organizationScreenFixtureFactory.createProject()],
            projectId: 11,
          }),
        },
      );

      await user.click(
        await screen.findByRole('button', {
          name: 'organization.management.projectsEditButton',
        }),
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/organization\.management\.projectsEditTitle/)).toBeInTheDocument();
    });

    it('opens the remove confirmation dialog for a listed project', async () => {
      const user = userEvent.setup();
      const deleteProject = vi.fn().mockResolvedValue(undefined);
      const actions = organizationScreenFixtureFactory.createActions({
        deleteProject,
      });

      renderWithProviders(
        <OrganizationScreen
          dashboardWorkspace={{
            loadOrganizationSelection: vi.fn().mockResolvedValue({
              organizations: [organizationScreenFixtureFactory.createOrganization()],
              organizationId: 3,
            }),
            loadOrganizationWorkspace: vi.fn().mockResolvedValue({
              organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
              projects: [
                organizationScreenFixtureFactory.createProject(),
                organizationScreenFixtureFactory.createProject({
                  id: 12,
                  name: 'Side Project',
                  description: null,
                }),
              ],
              projectId: 11,
            }),
            setOrganizationSelection: vi.fn(),
            setProjectSelection: vi.fn(),
          }}
          createOrganization={actions.createOrganization}
          createProject={actions.createProject}
          updateProject={actions.updateProject}
          deleteProject={actions.deleteProject}
        />,
      );

      const removeButtons = await screen.findAllByRole('button', {
        name: 'organization.management.projectsRemoveButton',
      });

      await user.click(removeButtons[0]);

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByText('organization.management.projectsRemoveDialogTitle'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('organization.management.projectsRemoveMigrationLabel'),
      ).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', {
        name: 'organization.management.projectsRemoveConfirm',
      });
      expect(confirmButton).toBeDisabled();

      await user.selectOptions(
        screen.getByLabelText('organization.management.projectsRemoveMigrationLabel'),
        '12',
      );

      expect(confirmButton).toBeEnabled();

      await user.click(confirmButton);

      expect(deleteProject).toHaveBeenCalledWith({
        projectId: 11,
        migrationProjectId: 12,
      });
    });
  });
});
