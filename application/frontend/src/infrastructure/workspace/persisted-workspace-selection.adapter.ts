import { inject, injectable } from 'inversify';
import type { WorkspaceSelectionPort } from '../../application/workspace/contracts/workspace-selection.port';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../application/workspace/shared/services/identifiers/project-identifier';
import type { OrganizationId } from '../../domains/organization/entities/organization';
import type { ProjectId } from '../../domains/project/entities/project';
import { type StoragePort, StoragePortToken } from '../../domains/shared/ports/storage.port';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';

@injectable()
export class PersistedWorkspaceSelectionAdapter implements WorkspaceSelectionPort {
  constructor(
    @inject(StoragePortToken)
    private readonly storage: StoragePort,
    @inject(OrganizationIdentifier)
    private readonly organizationIdentifier: OrganizationIdentifier,
    @inject(ProjectIdentifier)
    private readonly projectIdentifier: ProjectIdentifier,
  ) {}

  restoreSelection() {
    return {
      organizationId: this.organizationIdentifier.parseOrNull(
        this.storage.getItem(StorageKey.WORKSPACE_ORGANIZATION_ID),
      ),
      projectId: this.projectIdentifier.parseOrNull(
        this.storage.getItem(StorageKey.WORKSPACE_PROJECT_ID),
      ),
    };
  }

  setOrganizationId(organizationId: OrganizationId | null): void {
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

  setProjectId(projectId: ProjectId | null): void {
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
}
