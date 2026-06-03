import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../application/workspace/shared/services/identifiers/project-identifier';
import type { OrganizationId } from '../../domains/organization/entities/organization';
import type { Project, ProjectId } from '../../domains/project/entities/project';
import { coerceUuidV7TestValue } from './uuid-v7-test-value';

const organizationIdentifier = new OrganizationIdentifier();
const projectIdentifier = new ProjectIdentifier();

const DEFAULT_TIMESTAMP = '2026-03-12T00:00:00.000Z';

interface ProjectOverrides extends Omit<Partial<Project>, 'id' | 'organizationId'> {
  readonly id?: number | ProjectId;
  readonly organizationId?: number | OrganizationId;
}

export class ProjectFixtureFactory {
  createProject(overrides: ProjectOverrides = {}): Project {
    const { id, organizationId, ...restOverrides } = overrides;

    return {
      id:
        id === undefined
          ? projectIdentifier.parse(coerceUuidV7TestValue(11))
          : projectIdentifier.parse(typeof id === 'number' ? coerceUuidV7TestValue(id) : id),
      name: 'Flagship Project',
      description: 'Core project',
      organizationId:
        organizationId === undefined
          ? organizationIdentifier.parse(coerceUuidV7TestValue(3))
          : organizationIdentifier.parse(
              typeof organizationId === 'number'
                ? coerceUuidV7TestValue(organizationId)
                : organizationId,
            ),
      createdAt: DEFAULT_TIMESTAMP,
      ...restOverrides,
    };
  }
}
