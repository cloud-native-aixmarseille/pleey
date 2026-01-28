export interface WorkspaceSelection {
  readonly organizationId: number | null;
  readonly projectId: number | null;
}

export const WORKSPACE_SELECTION_PORT = Symbol.for('workspaceSelectionPort');

export interface WorkspaceSelectionPort {
  restoreSelection(): WorkspaceSelection;
  setOrganizationId(organizationId: number | null): void;
  setProjectId(projectId: number | null): void;
  clear(): void;
}
