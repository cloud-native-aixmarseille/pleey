import { vi } from 'vitest';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { ProjectIdentifier } from '../../application/workspace/shared/services/identifiers/project-identifier';
import {
  type Organization,
  type OrganizationId,
  OrganizationRole,
} from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import type { OrganizationMember } from '../../domains/organization/entities/organization-member';
import type {
  AddOrganizationMemberCommand,
  CreateOrganizationCommand,
  ListOrganizationMembersQuery,
  OrganizationRepository,
  RemoveOrganizationMemberCommand,
  UpdateOrganizationMemberRoleCommand,
} from '../../domains/organization/ports/organization-repository';
import type { Project, ProjectId } from '../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  ProjectRepository,
  UpdateProjectCommand,
} from '../../domains/project/ports/project-repository';
import type { PaginatedResult } from '../../domains/shared/value-objects/paginated-result';
import { DashboardReadGatewayMockFactory } from '../mocks/dashboard-read-gateway-mock-factory';
import { OrganizationFixtureFactory } from './organization-fixture-factory';
import { ProjectFixtureFactory } from './project-fixture-factory';
import { coerceUuidV7TestValue } from './uuid-v7-test-value';

const organizationIdentifier = new OrganizationIdentifier();
const organizationMemberIdentifier = new OrganizationMemberIdentifier();
const projectIdentifier = new ProjectIdentifier();
const userIdentifier = new UserIdentifier();
const defaultOrganizationId = organizationIdentifier.parse(coerceUuidV7TestValue(3));
const fallbackOrganizationId = organizationIdentifier.parse(coerceUuidV7TestValue(1));
const defaultProjectId = projectIdentifier.parse(coerceUuidV7TestValue(11));
const createdProjectId = projectIdentifier.parse(coerceUuidV7TestValue(101));
const createdOrganizationId = organizationIdentifier.parse(coerceUuidV7TestValue(99));
const defaultMemberId = organizationMemberIdentifier.parse(coerceUuidV7TestValue(1));
const defaultUserId = userIdentifier.parse(coerceUuidV7TestValue(1));

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
  readonly listOrganizationMembers: ReturnType<
    typeof vi.fn<OrganizationRepository['getOrganizationMembers']>
  >;
  readonly addOrganizationMember: ReturnType<
    typeof vi.fn<OrganizationRepository['addOrganizationMember']>
  >;
  readonly removeOrganizationMember: ReturnType<
    typeof vi.fn<OrganizationRepository['removeOrganizationMember']>
  >;
  readonly updateOrganizationMemberRole: ReturnType<
    typeof vi.fn<OrganizationRepository['updateOrganizationMemberRole']>
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
        id: defaultOrganizationId,
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
        .mockResolvedValue({
          id: createdOrganizationId,
          name: 'New Org',
          description: null,
          createdAt: DEFAULT_TIMESTAMP,
          updatedAt: DEFAULT_TIMESTAMP,
          role: OrganizationRole.OWNER,
        }),
      createProject: vi.fn<(_: CreateProjectCommand) => Promise<Project>>().mockResolvedValue(
        this.createProject({
          id: createdProjectId,
          name: 'New Project',
          description: null,
          organizationId: fallbackOrganizationId,
        }),
      ),
      listOrganizationMembers: vi
        .fn<(_: ListOrganizationMembersQuery) => Promise<PaginatedResult<OrganizationMember>>>()
        .mockResolvedValue({
          items: [],
          totalCount: 0,
          overallCount: 0,
          page: 1,
          pageSize: 25,
          totalPages: 1,
        }),
      addOrganizationMember: vi
        .fn<(_: AddOrganizationMemberCommand) => Promise<OrganizationMember>>()
        .mockResolvedValue({
          id: defaultMemberId,
          joinedAt: DEFAULT_TIMESTAMP,
          organizationId: fallbackOrganizationId,
          role: OrganizationRole.MEMBER,
          userId: defaultUserId,
          username: 'captain',
        }),
      removeOrganizationMember: vi
        .fn<(_: RemoveOrganizationMemberCommand) => Promise<void>>()
        .mockResolvedValue(undefined),
      updateOrganizationMemberRole: vi
        .fn<(_: UpdateOrganizationMemberRoleCommand) => Promise<OrganizationMember>>()
        .mockResolvedValue({
          id: defaultMemberId,
          joinedAt: DEFAULT_TIMESTAMP,
          organizationId: fallbackOrganizationId,
          role: OrganizationRole.MANAGER,
          userId: defaultUserId,
          username: 'captain',
        }),
      updateProject: vi.fn<(_: UpdateProjectCommand) => Promise<Project>>().mockResolvedValue(
        this.createProject({
          id: defaultProjectId,
          name: 'Updated Project',
          description: 'Updated',
          organizationId: fallbackOrganizationId,
        }),
      ),
      deleteProject: vi
        .fn<(_: DeleteProjectCommand) => Promise<void>>()
        .mockResolvedValue(undefined),
      ...overrides,
    };
  }
}
