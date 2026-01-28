import { describe, expect, it } from 'vitest';
import { StorageKey } from '../../../domains/shared/value-objects/storage-key';
import { StoragePortMockFactory } from '../../../test-utils/factories/storage-port-mock-factory';
import { AppPersistedWorkspaceSelectionRuntime } from './app-persisted-workspace-selection-runtime';

const storagePortMockFactory = new StoragePortMockFactory();

describe('AppPersistedWorkspaceSelectionRuntime', () => {
  it('restores persisted organization and project ids', () => {
    const storage = storagePortMockFactory.create({
      [StorageKey.WORKSPACE_ORGANIZATION_ID]: '15',
      [StorageKey.WORKSPACE_PROJECT_ID]: '44',
    });
    const service = new AppPersistedWorkspaceSelectionRuntime(storage);

    const selection = service.restoreSelection();

    expect(selection).toEqual({ organizationId: 15, projectId: 44 });
  });

  it('clears the project selection when the organization changes', () => {
    const storage = storagePortMockFactory.create({
      [StorageKey.WORKSPACE_ORGANIZATION_ID]: '4',
      [StorageKey.WORKSPACE_PROJECT_ID]: '30',
    });
    const service = new AppPersistedWorkspaceSelectionRuntime(storage);

    service.setOrganizationId(6);

    expect(storage.setItem).toHaveBeenCalledWith(StorageKey.WORKSPACE_ORGANIZATION_ID, '6');
    expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.WORKSPACE_PROJECT_ID);
  });

  it('clears both workspace keys when the organization is reset', () => {
    const storage = storagePortMockFactory.create();
    const service = new AppPersistedWorkspaceSelectionRuntime(storage);

    service.setOrganizationId(null);

    expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.WORKSPACE_ORGANIZATION_ID);
    expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.WORKSPACE_PROJECT_ID);
  });
});
