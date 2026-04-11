import { vi } from 'vitest';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../application/workspace/shared/services/identifiers/project-identifier';
import {
  type Organization,
  type OrganizationId,
} from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import type {
  CreateOrganizationCommand,
  OrganizationRepository,
} from '../../domains/organization/ports/organization-repository';
import type { Project, ProjectId } from '../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  ProjectRepository,
  UpdateProjectCommand,
} from '../../domains/project/ports/project-repository';
import { DashboardReadGatewayMockFactory } from '../mocks/dashboard-read-gateway-mock-factory';
import { OrganizationFixtureFactory } from './organization-fixture-factory';
import { ProjectFixtureFactory } from './project-fixture-factory';

const organizationIdentifier = new OrganizationIdentifier();
const projectIdentifier = new ProjectIdentifier();

const DEFAULT_TIMESTAMP = '2026-03-12T00:00:00.000Z';

interface ProjectFixtureOverrides extends Omit<Partial<Project>, 'id' | 'organizationId'> {
  readonly id?: number | ProjectId;
  readonly organizationId?: number | OrganizationId;
}

type OrganizationDashboardReadGateway = {
  loadOrganizations(): Promise<Organization[]>;
  loadOrganizationDashboard(organizationId: OrganizationId): Promise<OrganizationDashboard>;
  loadProjectsByOrganization(organizationId: OrganizationId): Promise<Project[]>;
};

interface OrganizationScreenActions {
  readonly createOrganization: ReturnType<
    typeof vi.fn<OrganizationRepository['createOrganization']>
  >;
  readonly createProject: ReturnType<typeof vi.fn<ProjectRepository['createProject']>>;
  readonly updateProject: ReturnType<typeof vi.fn<ProjectRepository['updateProject']>>;
  readonly deleteProject: ReturnType<typeof vi.fn<ProjectRepository['deleteProject']>>;
}

export class OrganizationScreenFixtureFactory {
  constructor(
    private readonly dashboardReadGatewayMockFactory = new DashboardReadGatewayMockFactory(),
    private readonly organizationFixtureFactory = new OrganizationFixtureFactory(),
    private readonly projectFixtureFactory = new ProjectFixtureFactory(),
  ) {}

  createProject(overrides: ProjectFixtureOverrides = {}): Project {
    return this.projectFixtureFactory.createProject({
      id: overrides.id ?? 11,
      name: 'Flagship Project',
      description: 'Core project',
      organizationId: overrides.organizationId ?? 3,
      createdAt: DEFAULT_TIMESTAMP,
      ...overrides,
    });
  }

  createOrganizationDashboard(
    overrides: Partial<OrganizationDashboard> = {},
  ): OrganizationDashboard {
    return this.organizationFixtureFactory.createOrganizationDashboard({
      organization: {
        id: 3,
        name: 'Active Org',
        description: null,
        ...overrides.organization,
      },
      stats: overrides.stats,
    });
  }

  createDashboardReadGateway(
    overrides: Partial<OrganizationDashboardReadGateway> = {},
  ): OrganizationDashboardReadGateway {
    return this.dashboardReadGatewayMockFactory.create({
      loadOrganizations: vi
        .fn()
        .mockResolvedValue([this.organizationFixtureFactory.createOrganization()]),
      loadOrganizationDashboard: vi.fn().mockResolvedValue(this.createOrganizationDashboard()),
      loadProjectsByOrganization: vi.fn().mockResolvedValue([]),
      ...overrides,
    });
  }

  createActions(overrides: Partial<OrganizationScreenActions> = {}): OrganizationScreenActions {
    return {
      createOrganization: vi
        .fn<(_: CreateOrganizationCommand) => Promise<Organization>>()
        .mockResolvedValue(
          this.organizationFixtureFactory.createCreatedOrganization({
            id: organizationIdentifier.parse(99),
            description: null,
          }),
        ),
      createProject: vi.fn<(_: CreateProjectCommand) => Promise<Project>>().mockResolvedValue(
        this.createProject({
          id: projectIdentifier.parse(101),
          name: 'New Project',
          description: null,
          organizationId: organizationIdentifier.parse(1),
        }),
      ),
      updateProject: vi.fn<(_: UpdateProjectCommand) => Promise<Project>>().mockResolvedValue(
        this.createProject({
          id: projectIdentifier.parse(11),
          name: 'Updated Project',
          description: 'Updated',
          organizationId: organizationIdentifier.parse(1),
        }),
      ),
      deleteProject: vi
        .fn<(_: DeleteProjectCommand) => Promise<void>>()
        .mockResolvedValue(undefined),
      ...overrides,
    };
  }
}
