import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type {
  Organization,
  OrganizationId,
} from '../../../../../domains/organization/entities/organization';
import { OrganizationRole } from '../../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../../domains/organization/entities/organization-dashboard';
import type { OrganizationMember } from '../../../../../domains/organization/entities/organization-member';
import type { Project, ProjectId } from '../../../../../domains/project/entities/project';
import type { PaginatedResult } from '../../../../../domains/shared/value-objects/paginated-result';
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

function createOrganizationMember(overrides: Partial<OrganizationMember> = {}): OrganizationMember {
  return {
    id: 21 as OrganizationMember['id'],
    joinedAt: '2026-03-20T10:00:00.000Z',
    organizationId: organizationIdentifier.parse(3),
    role: OrganizationRole.MEMBER,
    userId: 42,
    username: 'captain',
    ...overrides,
  };
}

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

function createPaginatedResult<TItem>(items: readonly TItem[]): PaginatedResult<TItem> {
  return {
    items,
    totalCount: items.length,
    overallCount: items.length,
    page: 1,
    pageSize: 25,
    totalPages: 1,
  };
}

type LegacyOrganizationSelection = {
  readonly organizations: readonly Organization[];
  readonly organizationId: OrganizationId | null;
};

type NormalizedOrganizationSelection = Awaited<
  ReturnType<DashboardWorkspaceSelectionGateway['restoreOrganizationSelection']>
>;

type LegacyOrganizationWorkspace = {
  readonly organizationDashboard: OrganizationDashboard | null;
  readonly projects: readonly Project[];
  readonly projectId: ProjectId | null;
};

type NormalizedOrganizationWorkspace = Awaited<
  ReturnType<DashboardWorkspaceSelectionGateway['loadOrganizationWorkspaceState']>
>;

function normalizeOrganizationSelectionResult(
  result: LegacyOrganizationSelection | NormalizedOrganizationSelection,
): NormalizedOrganizationSelection {
  if ('organizationsPage' in result) {
    return result;
  }

  return {
    organizationsPage: createPaginatedResult(result.organizations),
    organizationId: result.organizationId,
  };
}

function normalizeOrganizationWorkspaceResult(
  result: LegacyOrganizationWorkspace | NormalizedOrganizationWorkspace,
): NormalizedOrganizationWorkspace {
  if ('projectsPage' in result) {
    return result;
  }

  return {
    organizationDashboard: result.organizationDashboard,
    projectsPage: createPaginatedResult(result.projects),
    projectId: result.projectId,
  };
}

function renderOrganizationScreen(
  overrides: Partial<
    ReturnType<OrganizationScreenFixtureFactory['createDashboardReadGateway']>
  > = {},
  dashboardWorkspaceOverrides: Partial<DashboardWorkspaceSelectionGateway> = {},
  options: RenderOrganizationScreenOptions = {},
  actionOverrides: Partial<ReturnType<OrganizationScreenFixtureFactory['createActions']>> = {},
) {
  const actions = organizationScreenFixtureFactory.createActions(actionOverrides);
  const listOrganizationMembers = vi.fn<
    (
      query: Parameters<typeof actions.listOrganizationMembers>[0],
    ) => Promise<PaginatedResult<OrganizationMember>>
  >(async (query) => {
    const result = (await actions.listOrganizationMembers(query)) as
      | PaginatedResult<OrganizationMember>
      | readonly OrganizationMember[];

    if ('items' in result) {
      return result;
    }

    return createPaginatedResult<OrganizationMember>(result);
  });

  const shouldDeferWorkspaceLoad = options.deferWorkspaceLoad ?? false;
  const restoreOrganizationSelection = shouldDeferWorkspaceLoad
    ? vi
        .fn<DashboardWorkspaceSelectionGateway['restoreOrganizationSelection']>()
        .mockImplementation(() => createPendingPromise())
    : vi.fn().mockResolvedValue({
        organizationsPage: createPaginatedResult([organizationFixtureFactory.createOrganization()]),
        organizationId: organizationIdentifier.parse(3),
      });
  const loadOrganizationWorkspaceState = shouldDeferWorkspaceLoad
    ? vi
        .fn<DashboardWorkspaceSelectionGateway['loadOrganizationWorkspaceState']>()
        .mockImplementation(() => createPendingPromise())
    : vi.fn().mockResolvedValue({
        organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
        projectsPage: createPaginatedResult([]),
        projectId: null,
      });
  const loadOrganizationsPage = vi
    .fn()
    .mockResolvedValue(createPaginatedResult([organizationFixtureFactory.createOrganization()]));
  const loadOrganizationProjectsPage = vi.fn().mockResolvedValue(createPaginatedResult([]));
  const dashboardWorkspace: DashboardWorkspaceSelectionGateway = {
    loadOrganizationsPage,
    loadOrganizationProjectsPage,
    restoreOrganizationSelection,
    loadOrganizationWorkspaceState,
    setOrganizationSelection: vi.fn(),
    setProjectSelection: vi.fn(),
    ...overrides,
    ...dashboardWorkspaceOverrides,
  };

  if (dashboardWorkspace.restoreOrganizationSelection !== restoreOrganizationSelection) {
    const originalRestore = dashboardWorkspace.restoreOrganizationSelection;
    dashboardWorkspace.restoreOrganizationSelection = vi.fn(async (query) =>
      normalizeOrganizationSelectionResult((await originalRestore(query as never)) as never),
    );
  }

  if (dashboardWorkspace.loadOrganizationWorkspaceState !== loadOrganizationWorkspaceState) {
    const originalLoad = dashboardWorkspace.loadOrganizationWorkspaceState;
    dashboardWorkspace.loadOrganizationWorkspaceState = vi.fn(async (query) =>
      normalizeOrganizationWorkspaceResult((await originalLoad(query as never)) as never),
    );
  }

  return {
    ...actions,
    listOrganizationMembers,
    ...renderWithProviders(
      <OrganizationScreen
        dashboardWorkspace={dashboardWorkspace}
        createOrganization={actions.createOrganization}
        listOrganizationMembers={listOrganizationMembers}
        addOrganizationMember={actions.addOrganizationMember}
        removeOrganizationMember={(member) =>
          actions.removeOrganizationMember({ memberId: member.id })
        }
        updateOrganizationMemberRole={actions.updateOrganizationMemberRole}
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
      const toolbar = screen.getByRole('toolbar', {
        name: 'organization.management.header.title',
      });

      expect(toolbar).toBeInTheDocument();
      expect(within(toolbar).getAllByRole('button')[0]).toBeInTheDocument();
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
      const toolbar = await screen.findByRole('toolbar', {
        name: 'organization.management.header.title',
      });

      expect(within(toolbar).getAllByRole('button')[0]).toHaveTextContent('Active Org');
      expect(screen.queryByRole('heading', { name: 'Active Org' })).not.toBeInTheDocument();
      expect(screen.getByText('The best org')).toBeInTheDocument();
      expect(screen.getByText('owner')).toBeInTheDocument();
    });

    it('loads organizations through the async selector search', async () => {
      const user = userEvent.setup();
      const loadOrganizationsPage = vi
        .fn()
        .mockResolvedValue(
          createPaginatedResult([organizationFixtureFactory.createOrganization()]),
        );

      renderOrganizationScreen({}, { loadOrganizationsPage });

      const toolbar = await screen.findByRole('toolbar', {
        name: 'organization.management.header.title',
      });

      await user.click(within(toolbar).getAllByRole('button')[0]);
      await user.type(
        screen.getByLabelText('dashboard.workspace.organizationSearchLabel'),
        'Arcade',
      );

      await waitFor(() => {
        expect(loadOrganizationsPage).toHaveBeenCalledWith({
          page: 1,
          pageSize: 25,
          search: 'Arcade',
        });
      });
    });

    it('loads projects through the project search input', async () => {
      const user = userEvent.setup();
      const loadOrganizationWorkspaceState = vi.fn().mockResolvedValue({
        organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
        projectsPage: createPaginatedResult([
          organizationScreenFixtureFactory.createProject({ name: 'Flagship Project' }),
        ]),
        projectId: projectIdentifier.parse(11),
      });

      renderOrganizationScreen({}, { loadOrganizationWorkspaceState });

      await user.type(
        await screen.findByRole('searchbox', { name: 'project.management.searchLabel' }),
        'Flag',
      );

      await waitFor(() => {
        expect(loadOrganizationWorkspaceState).toHaveBeenLastCalledWith({
          organizationId: organizationIdentifier.parse(3),
          page: 1,
          pageSize: 25,
          search: 'Flag',
        });
      });
    });

    it('loads members through the member search input', async () => {
      const user = userEvent.setup();

      const view = renderOrganizationScreen();

      await user.type(
        await screen.findByRole('searchbox', {
          name: 'organization.management.members.searchLabel',
        }),
        'captain',
      );

      await waitFor(() => {
        expect(view.listOrganizationMembers).toHaveBeenLastCalledWith({
          organizationId: organizationIdentifier.parse(3),
          page: 1,
          pageSize: 25,
          search: 'captain',
        });
      });
    });

    it('loads the next project page from pagination controls', async () => {
      const user = userEvent.setup();
      const loadOrganizationWorkspaceState = vi
        .fn()
        .mockResolvedValueOnce({
          organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
          projectsPage: {
            ...createPaginatedResult([
              organizationScreenFixtureFactory.createProject({ name: 'Page One Project' }),
            ]),
            totalPages: 2,
          },
          projectId: projectIdentifier.parse(11),
        })
        .mockResolvedValueOnce({
          organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
          projectsPage: {
            ...createPaginatedResult([
              organizationScreenFixtureFactory.createProject({
                id: projectIdentifier.parse(12),
                name: 'Page Two Project',
              }),
            ]),
            page: 2,
            totalPages: 2,
          },
          projectId: projectIdentifier.parse(12),
        });

      renderOrganizationScreen({}, { loadOrganizationWorkspaceState });

      await user.click(
        await screen.findByRole('button', { name: 'project.management.pagination.next' }),
      );

      await waitFor(() => {
        expect(loadOrganizationWorkspaceState).toHaveBeenLastCalledWith({
          organizationId: organizationIdentifier.parse(3),
          page: 2,
          pageSize: 25,
          search: undefined,
        });
      });
    });

    it('loads the next member page from pagination controls', async () => {
      const user = userEvent.setup();
      const view = renderOrganizationScreen(
        {},
        {},
        {},
        {
          listOrganizationMembers: vi
            .fn()
            .mockResolvedValueOnce({
              items: [createOrganizationMember()],
              totalCount: 1,
              overallCount: 2,
              page: 1,
              pageSize: 25,
              totalPages: 2,
            })
            .mockResolvedValueOnce({
              items: [createOrganizationMember({ id: 22 as OrganizationMember['id'] })],
              totalCount: 1,
              overallCount: 2,
              page: 2,
              pageSize: 25,
              totalPages: 2,
            }),
        },
      );

      await user.click(
        await screen.findByRole('button', {
          name: 'organization.management.members.pagination.next',
        }),
      );

      await waitFor(() => {
        expect(view.listOrganizationMembers).toHaveBeenLastCalledWith({
          organizationId: organizationIdentifier.parse(3),
          page: 2,
          pageSize: 25,
          search: undefined,
        });
      });
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
            loadOrganizationsPage: vi
              .fn()
              .mockResolvedValue(
                createPaginatedResult([organizationFixtureFactory.createOrganization()]),
              ),
            loadOrganizationProjectsPage: vi.fn().mockResolvedValue(createPaginatedResult([])),
            restoreOrganizationSelection: vi.fn().mockResolvedValue({
              organizationsPage: createPaginatedResult([
                organizationFixtureFactory.createOrganization(),
              ]),
              organizationId: organizationIdentifier.parse(3),
            }),
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: organizationScreenFixtureFactory.createOrganizationDashboard(),
              projectsPage: createPaginatedResult([
                organizationScreenFixtureFactory.createProject(),
                organizationScreenFixtureFactory.createProject({
                  id: projectIdentifier.parse(12),
                  name: 'Side Project',
                  description: null,
                }),
              ]),
              projectId: projectIdentifier.parse(11),
            }),
            setOrganizationSelection: vi.fn(),
            setProjectSelection: vi.fn(),
          }}
          createOrganization={actions.createOrganization}
          listOrganizationMembers={actions.listOrganizationMembers}
          addOrganizationMember={actions.addOrganizationMember}
          removeOrganizationMember={(member) =>
            actions.removeOrganizationMember({ memberId: member.id })
          }
          updateOrganizationMemberRole={actions.updateOrganizationMemberRole}
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

      const dialog = await screen.findByRole('dialog');

      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('project.management.removal.dialogTitle')).toBeInTheDocument();
      expect(
        screen.getByLabelText('project.management.removal.migrationLabel'),
      ).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', {
        name: 'project.management.removal.confirm',
      });
      expect(confirmButton).toBeDisabled();

      await user.click(screen.getByLabelText('project.management.removal.migrationLabel'));
      await user.type(within(dialog).getByLabelText('project.management.searchLabel'), 'Side');
      await user.keyboard('{Enter}');

      expect(confirmButton).toBeEnabled();

      await user.click(confirmButton);

      expect(deleteProject).toHaveBeenCalledWith({
        projectId: projectIdentifier.parse(11),
        migrationProjectId: projectIdentifier.parse(12),
      });
    });

    it('renders organization members for the selected organization', async () => {
      const member = createOrganizationMember({ role: OrganizationRole.MANAGER });

      renderOrganizationScreen(
        {},
        {},
        { deferWorkspaceLoad: false },
        {
          listOrganizationMembers: vi.fn().mockResolvedValue([member]),
        },
      );

      expect(await screen.findByText('captain')).toBeInTheDocument();
      expect(
        screen.getAllByText('organization.management.members.roles.manager').length,
      ).toBeGreaterThan(0);
    });

    it('updates an organization member role from the member list', async () => {
      const user = userEvent.setup();
      const member = createOrganizationMember();
      const updateOrganizationMemberRole = vi.fn().mockResolvedValue({
        ...member,
        role: OrganizationRole.MANAGER,
      });

      renderOrganizationScreen(
        {},
        {},
        { deferWorkspaceLoad: false },
        {
          listOrganizationMembers: vi.fn().mockResolvedValue([member]),
          updateOrganizationMemberRole,
        },
      );

      await user.selectOptions(
        await screen.findByLabelText('organization.management.members.roleLabel'),
        OrganizationRole.MANAGER,
      );

      await waitFor(() => {
        expect(updateOrganizationMemberRole).toHaveBeenCalledWith({
          memberId: member.id,
          role: OrganizationRole.MANAGER,
        });
      });
    });

    it('hides owner-only member actions for managers', async () => {
      const ownerMember = createOrganizationMember({ role: OrganizationRole.OWNER });

      renderOrganizationScreen(
        {},
        {
          restoreOrganizationSelection: vi.fn().mockResolvedValue({
            organizations: [
              organizationFixtureFactory.createOrganization({ role: OrganizationRole.MANAGER }),
            ],
            organizationId: organizationIdentifier.parse(3),
          }),
        },
        { deferWorkspaceLoad: false },
        {
          listOrganizationMembers: vi.fn().mockResolvedValue([ownerMember]),
        },
      );

      await screen.findByText('captain');

      expect(
        screen.queryAllByRole('option', {
          name: 'organization.management.members.roles.owner',
        }),
      ).toHaveLength(0);
      expect(
        screen.queryByRole('button', { name: 'organization.management.members.removeButton' }),
      ).toBeNull();
      expect(
        screen.getAllByText('organization.management.members.roles.owner').length,
      ).toBeGreaterThan(0);
    });

    it('adds an organization member from the member form', async () => {
      const user = userEvent.setup();
      const addOrganizationMember = vi.fn().mockResolvedValue(createOrganizationMember());

      renderOrganizationScreen({}, {}, { deferWorkspaceLoad: false }, { addOrganizationMember });

      await user.type(
        await screen.findByLabelText(/organization\.management\.members\.usernameOrEmailLabel/),
        'captain@pleey.io',
      );
      await user.click(
        screen.getByRole('button', { name: 'organization.management.members.addButton' }),
      );

      await waitFor(() => {
        expect(addOrganizationMember).toHaveBeenCalledWith({
          organizationId: organizationIdentifier.parse(3),
          role: OrganizationRole.MEMBER,
          usernameOrEmail: 'captain@pleey.io',
        });
      });
    });

    it('removes an organization member from the member list', async () => {
      const user = userEvent.setup();
      const member = createOrganizationMember();
      const removeOrganizationMember = vi.fn().mockResolvedValue(undefined);

      renderOrganizationScreen(
        {},
        {},
        { deferWorkspaceLoad: false },
        {
          listOrganizationMembers: vi.fn().mockResolvedValue([member]),
          removeOrganizationMember,
        },
      );

      await user.click(
        await screen.findByRole('button', {
          name: 'organization.management.members.removeButton',
        }),
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByText('organization.management.members.removal.dialogTitle'),
      ).toBeInTheDocument();

      expect(removeOrganizationMember).not.toHaveBeenCalled();

      await user.click(
        screen.getByRole('button', {
          name: 'organization.management.members.removal.confirm',
        }),
      );

      await waitFor(() => {
        expect(removeOrganizationMember).toHaveBeenCalledWith({ memberId: member.id });
      });
    });
  });
});
