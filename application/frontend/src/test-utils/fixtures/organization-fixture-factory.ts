import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import {
  type Organization,
  type OrganizationId,
  OrganizationRole,
} from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import { coerceUuidV7TestValue } from './uuid-v7-test-value';

const organizationIdentifier = new OrganizationIdentifier();

const DEFAULT_TIMESTAMP = '2026-03-12T00:00:00.000Z';
const DEFAULT_CREATED_ORGANIZATION_TIMESTAMP = '2026-03-15T10:00:00.000Z';

interface OrganizationOverrides extends Omit<Partial<Organization>, 'id'> {
  readonly id?: number | OrganizationId;
}

interface OrganizationSummaryOverrides {
  readonly description?: string | null;
  readonly id?: number | OrganizationId;
  readonly name?: string;
}

interface OrganizationDashboardOverrides
  extends Omit<Partial<OrganizationDashboard>, 'organization'> {
  readonly organization?: OrganizationSummaryOverrides;
}

export class OrganizationFixtureFactory {
  createOrganization(overrides: OrganizationOverrides = {}): Organization {
    const { id, ...restOverrides } = overrides;

    return {
      id:
        id === undefined
          ? organizationIdentifier.parse(coerceUuidV7TestValue(3))
          : organizationIdentifier.parse(typeof id === 'number' ? coerceUuidV7TestValue(id) : id),
      name: 'Active Org',
      description: null,
      createdAt: DEFAULT_TIMESTAMP,
      updatedAt: DEFAULT_TIMESTAMP,
      role: OrganizationRole.OWNER,
      ...restOverrides,
    };
  }

  createCreatedOrganization(overrides: OrganizationOverrides = {}): Organization {
    return this.createOrganization({
      id: organizationIdentifier.parse(coerceUuidV7TestValue(42)),
      name: 'New Org',
      description: 'A test org',
      createdAt: DEFAULT_CREATED_ORGANIZATION_TIMESTAMP,
      updatedAt: DEFAULT_CREATED_ORGANIZATION_TIMESTAMP,
      role: OrganizationRole.OWNER,
      ...overrides,
    });
  }

  createOrganizationSummary(overrides: OrganizationSummaryOverrides = {}) {
    const organization = this.createOrganization(
      overrides.id === undefined
        ? {
            description: overrides.description,
            name: overrides.name,
          }
        : {
            id:
              typeof overrides.id === 'number'
                ? organizationIdentifier.parse(coerceUuidV7TestValue(overrides.id))
                : overrides.id,
            description: overrides.description,
            name: overrides.name,
          },
    );

    return {
      id: organization.id,
      name: organization.name,
      description: organization.description,
    };
  }

  createOrganizationDashboard(
    overrides: OrganizationDashboardOverrides = {},
  ): OrganizationDashboard {
    return {
      organization: this.createOrganizationSummary(overrides.organization),
      stats: {
        totalGames: 0,
        totalMembers: 0,
        totalProjects: 0,
        ...overrides.stats,
      },
    };
  }
}
