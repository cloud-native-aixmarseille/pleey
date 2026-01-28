import { vi } from 'vitest';
import type { DashboardReadGateway } from '../../application/workspace/dashboard/gateways/dashboard-read.gateway';
import {
  type Organization,
  OrganizationRole,
} from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import type {
  CreateOrganizationCommand,
  OrganizationRepository,
} from '../../domains/organization/ports/organization-repository';
import type { Project } from '../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  ProjectRepository,
  UpdateProjectCommand,
} from '../../domains/project/ports/project-repository';
import { DashboardReadGatewayMockFactory } from './dashboard-read-gateway-mock-factory';

const DEFAULT_TIMESTAMP = '2026-03-12T00:00:00.000Z';

export interface OrganizationScreenActions {
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
  ) {}

  createOrganization(overrides: Partial<Organization> = {}): Organization {
    return {
      id: 3,
      name: 'Active Org',
      description: null,
      createdAt: DEFAULT_TIMESTAMP,
      updatedAt: DEFAULT_TIMESTAMP,
      role: OrganizationRole.OWNER,
      ...overrides,
    };
  }

  createProject(overrides: Partial<Project> = {}): Project {
    return {
      id: 11,
      name: 'Flagship Project',
      description: 'Core project',
      organizationId: 3,
      createdAt: DEFAULT_TIMESTAMP,
      ...overrides,
    };
  }

  createOrganizationDashboard(
    overrides: Partial<OrganizationDashboard> = {},
  ): OrganizationDashboard {
    return {
      organization: {
        id: 3,
        name: 'Active Org',
        description: null,
        ...overrides.organization,
      },
      stats: {
        totalGames: 0,
        totalGameSessions: 0,
        activeGameSessions: 0,
        totalMembers: 0,
        totalProjects: 0,
        ...overrides.stats,
      },
    };
  }

  createDashboardReadGateway(overrides: Partial<DashboardReadGateway> = {}): DashboardReadGateway {
    return this.dashboardReadGatewayMockFactory.create({
      loadOrganizations: vi.fn().mockResolvedValue([this.createOrganization()]),
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
          this.createOrganization({
            id: 99,
            name: 'New Org',
            description: null,
          }),
        ),
      createProject: vi.fn<(_: CreateProjectCommand) => Promise<Project>>().mockResolvedValue(
        this.createProject({
          id: 101,
          name: 'New Project',
          description: null,
          organizationId: 1,
        }),
      ),
      updateProject: vi.fn<(_: UpdateProjectCommand) => Promise<Project>>().mockResolvedValue(
        this.createProject({
          id: 11,
          name: 'Updated Project',
          description: 'Updated',
          organizationId: 1,
        }),
      ),
      deleteProject: vi
        .fn<(_: DeleteProjectCommand) => Promise<void>>()
        .mockResolvedValue(undefined),
      ...overrides,
    };
  }
}
