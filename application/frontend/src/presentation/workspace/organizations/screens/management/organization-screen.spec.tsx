import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationFixtureFactory } from '../../../../../test-utils/fixtures/organization-fixture-factory';
import { OrganizationScreenFixtureFactory } from '../../../../../test-utils/fixtures/organization-screen-fixture-factory';
import { OrganizationIdentifierMockFactory } from '../../../../../test-utils/mocks/organization-identifier-mock-factory';
import { ProjectIdentifierMockFactory } from '../../../../../test-utils/mocks/project-identifier-mock-factory';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import type { DashboardWorkspaceSelectionGateway } from '../../../dashboard/hooks/use-dashboard-workspace';
import { OrganizationScreen } from './organization-screen';

const organizationIdentifier = new OrganizationIdentifierMockFactory().create();
const projectIdentifier = new ProjectIdentifierMockFactory().create();

const organizationScreenFixtureFactory = new OrganizationScreenFixtureFactory();
const organizationFixtureFactory = new OrganizationFixtureFactory();

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
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
  dashboardWorkspaceOverrides: Partial<DashboardWorkspaceSelectionGateway> = {},
  options: RenderOrganizationScreenOptions = {},
) {
  const actions = organizationScreenFixtureFactory.createActions();
  const shouldDeferWorkspaceLoad = options.deferWorkspaceLoad ?? false;
  const dashboardWorkspace: DashboardWorkspaceSelectionGateway = {
    restoreOrganizationSelection: shouldDeferWorkspaceLoad
      ? vi
          .fn<DashboardWorkspaceSelectionGateway['restoreOrganizationSelection']>()
          .mockImplementation(() => createPendingPromise())
      : vi.fn().mockResolvedValue({
          organizations: [organizationFixtureFactory.createOrganization()],
          organizationId: organizationIdentifier.parse(3),
        }),
    loadOrganizationWorkspaceState: shouldDeferWorkspaceLoad
      ? vi
          .fn<DashboardWorkspaceSelectionGateway['loadOrganizationWorkspaceState']>()
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
        screen.getByRole('heading', { name: 'organization.management.header.title' }),
      ).toBeInTheDocument();
    });

    it('renders the page header kicker', () => {
      // Arrange + Act
      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: true });

      // Assert
      expect(screen.getByText('organization.management.header.eyebrow')).toBeInTheDocument();
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
      expect(screen.getByText('organization.management.details.empty')).toBeInTheDocument();
    });

    it('renders the create organization action in the page header', () => {
      // Arrange + Act
      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: true });

      // Assert
      expect(
        screen.getByRole('button', { name: 'organization.management.create.openButton' }),
      ).toBeInTheDocument();
    });

    it('renders the project management section', () => {
      // Arrange + Act
      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: true });

      // Assert
      expect(
        screen.getByRole('heading', { name: 'project.management.section.title' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'project.management.section.createButton' }),
      ).toBeInTheDocument();
      expect(screen.getByText('project.management.list.empty')).toBeInTheDocument();
    });

    it('disables project removal when the organization only has one project', async () => {
      const user = userEvent.setup();
      const deleteProject = vi.fn().mockResolvedValue(undefined);

      renderOrganizationScreen(
        {
          loadOrganizations: vi
            .fn()
            .mockResolvedValue([organizationFixtureFactory.createOrganization()]),
          loadOrganizationDashboard: vi.fn().mockResolvedValue(
            organizationScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 2,
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
          loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 2,
                totalMembers: 3,
                totalProjects: 1,
              },
            }),
            projects: [organizationScreenFixtureFactory.createProject()],
            projectId: projectIdentifier.parse(11),
          }),
        },
      ).deleteProject.mockImplementation(deleteProject);

      const removeButton = await screen.findByRole('button', {
        name: 'project.management.list.removeButton',
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
              organizationFixtureFactory.createOrganization({ description: 'The best org' }),
            ]),
        },
        {
          restoreOrganizationSelection: vi.fn().mockResolvedValue({
            organizations: [
              organizationFixtureFactory.createOrganization({ description: 'The best org' }),
            ],
            organizationId: organizationIdentifier.parse(3),
          }),
          loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard({
              organization: {
                id: organizationIdentifier.parse(3),
                name: 'Active Org',
                description: 'The best org',
              },
              stats: {
                totalGames: 5,
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
            .mockResolvedValue([organizationFixtureFactory.createOrganization()]),
        },
        {
          loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 5,
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
        await screen.findByRole('region', { name: 'organization.management.stats.title' }),
      ).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders organization projects and highlights the selected project', async () => {
      // Arrange
      renderOrganizationScreen(
        {},
        {
          loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 5,
                totalMembers: 8,
                totalProjects: 2,
              },
            }),
            projects: [
              organizationScreenFixtureFactory.createProject(),
              organizationScreenFixtureFactory.createProject({
                id: projectIdentifier.parse(12),
                name: 'Side Project',
                description: null,
              }),
            ],
            projectId: projectIdentifier.parse(11),
          }),
        },
      );

      // Assert
      expect(await screen.findByText('Flagship Project')).toBeInTheDocument();
      expect(screen.getByText('Side Project')).toBeInTheDocument();
      expect(screen.getByText('project.management.list.selectedBadge')).toBeInTheDocument();
      expect(screen.getByText('project.management.list.descriptionFallback')).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: 'project.management.list.editButton' }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole('button', { name: 'project.management.list.removeButton' }),
      ).toHaveLength(2);
    });

    it('opens the create project dialog from the projects section', async () => {
      const user = userEvent.setup();

      renderOrganizationScreen(
        {
          loadOrganizations: vi
            .fn()
            .mockResolvedValue([organizationFixtureFactory.createOrganization()]),
        },
        {
          loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
            projects: [],
            projectId: null,
          }),
        },
      );

      await user.click(
        await screen.findByRole('button', {
          name: 'project.management.section.createButton',
        }),
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/project\.management\.form\.create\.title/)).toBeInTheDocument();
    });

    it('selects the newly created organization after a successful creation', async () => {
      const user = userEvent.setup();
      const setOrganizationSelection = vi.fn();
      const createdOrganization = organizationFixtureFactory.createCreatedOrganization({
        description: 'Fresh workspace',
        id: organizationIdentifier.parse(9),
        name: 'Fresh Org',
      });
      const view = renderOrganizationScreen(
        {},
        {
          setOrganizationSelection,
        },
        { deferWorkspaceLoad: true },
      );

      view.createOrganization.mockResolvedValue(createdOrganization);

      await user.click(
        screen.getByRole('button', { name: 'organization.management.create.openButton' }),
      );
      await user.type(
        await screen.findByLabelText(/organization\.management\.create\.fields\.name\.label/),
        'Fresh Org',
      );
      await user.type(
        screen.getByLabelText(/organization\.management\.create\.fields\.description\.label/),
        'Fresh workspace',
      );
      await user.click(
        screen.getByRole('button', { name: 'organization.management.create.submit' }),
      );

      await waitFor(() => {
        expect(setOrganizationSelection).toHaveBeenCalledWith(organizationIdentifier.parse(9));
      });
    });

    it('opens the edit project dialog for a listed project', async () => {
      const user = userEvent.setup();
      renderOrganizationScreen(
        {},
        {
          loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
            organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
            projects: [organizationScreenFixtureFactory.createProject()],
            projectId: projectIdentifier.parse(11),
          }),
        },
      );

      await user.click(
        await screen.findByRole('button', {
          name: 'project.management.list.editButton',
        }),
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/project\.management\.form\.edit\.title/)).toBeInTheDocument();
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
            restoreOrganizationSelection: vi.fn().mockResolvedValue({
              organizations: [organizationFixtureFactory.createOrganization()],
              organizationId: organizationIdentifier.parse(3),
            }),
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
              projects: [
                organizationScreenFixtureFactory.createProject(),
                organizationScreenFixtureFactory.createProject({
                  id: projectIdentifier.parse(12),
                  name: 'Side Project',
                  description: null,
                }),
              ],
              projectId: projectIdentifier.parse(11),
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

      await screen.findByText('Flagship Project');

      const removeButtons = screen.getAllByRole('button', {
        name: 'project.management.list.removeButton',
      });

      await user.click(removeButtons[0]);

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('project.management.removal.dialogTitle')).toBeInTheDocument();
      expect(
        screen.getByLabelText('project.management.removal.migrationLabel'),
      ).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', {
        name: 'project.management.removal.confirm',
      });
      expect(confirmButton).toBeDisabled();

      await user.selectOptions(
        screen.getByLabelText('project.management.removal.migrationLabel'),
        '12',
      );

      expect(confirmButton).toBeEnabled();

      await user.click(confirmButton);

      expect(deleteProject).toHaveBeenCalledWith({
        projectId: projectIdentifier.parse(11),
        migrationProjectId: projectIdentifier.parse(12),
      });
    });
  });
});
