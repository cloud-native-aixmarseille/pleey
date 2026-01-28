import { inject, injectable } from 'inversify';
import { AUTH_SERVICE_ID } from '../../../application/identity/contracts/auth-service-id';
import type { WorkspaceSelectionPort } from '../../../application/workspace/contracts/workspace-selection.port';
import type { StoragePort } from '../../../domains/shared/ports/storage.port';
import { StorageKey } from '../../../domains/shared/value-objects/storage-key';

@injectable()
export class AppPersistedWorkspaceSelectionRuntime implements WorkspaceSelectionPort {
  constructor(
    @inject(AUTH_SERVICE_ID.storagePort)
    private readonly storage: StoragePort,
  ) {}

  restoreSelection() {
    return {
      organizationId: this.parseNumeric(this.storage.getItem(StorageKey.WORKSPACE_ORGANIZATION_ID)),
      projectId: this.parseNumeric(this.storage.getItem(StorageKey.WORKSPACE_PROJECT_ID)),
    };
  }

  setOrganizationId(organizationId: number | null): void {
    const previousOrganizationId = this.storage.getItem(StorageKey.WORKSPACE_ORGANIZATION_ID);

    if (organizationId === null) {
      this.storage.removeItem(StorageKey.WORKSPACE_ORGANIZATION_ID);
      this.storage.removeItem(StorageKey.WORKSPACE_PROJECT_ID);
      return;
    }

    this.storage.setItem(StorageKey.WORKSPACE_ORGANIZATION_ID, String(organizationId));

    if (previousOrganizationId !== String(organizationId)) {
      this.storage.removeItem(StorageKey.WORKSPACE_PROJECT_ID);
    }
  }

  setProjectId(projectId: number | null): void {
    if (projectId === null) {
      this.storage.removeItem(StorageKey.WORKSPACE_PROJECT_ID);
      return;
    }

    this.storage.setItem(StorageKey.WORKSPACE_PROJECT_ID, String(projectId));
  }

  clear(): void {
    this.storage.removeItem(StorageKey.WORKSPACE_ORGANIZATION_ID);
    this.storage.removeItem(StorageKey.WORKSPACE_PROJECT_ID);
  }

  private parseNumeric(raw: string | null): number | null {
    if (raw === null) {
      return null;
    }

    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
