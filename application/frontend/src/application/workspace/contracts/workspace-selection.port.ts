import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { ProjectId } from '../../../domains/project/entities/project';

export interface WorkspaceSelection {
  readonly organizationId: OrganizationId | null;
  readonly projectId: ProjectId | null;
}

export const WORKSPACE_SELECTION_PORT = Symbol.for('workspaceSelectionPort');

export interface WorkspaceSelectionPort {
  restoreSelection(): WorkspaceSelection;
  setOrganizationId(organizationId: OrganizationId | null): void;
  setProjectId(projectId: ProjectId | null): void;
  clear(): void;
}
