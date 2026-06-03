import { describe, expect, it } from 'vitest';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { OrganizationIdentifierMockFactory } from '../../test-utils/mocks/organization-identifier-mock-factory';
import { ProjectIdentifierMockFactory } from '../../test-utils/mocks/project-identifier-mock-factory';
import { StoragePortMockFactory } from '../../test-utils/mocks/storage-port-mock-factory';
import { PersistedWorkspaceSelectionAdapter } from './persisted-workspace-selection.adapter';

const organizationIdentifier = new OrganizationIdentifierMockFactory().create();
const projectIdentifier = new ProjectIdentifierMockFactory().create();

const storagePortMockFactory = new StoragePortMockFactory();

describe('PersistedWorkspaceSelectionAdapter', () => {
  it('restores persisted organization and project ids', () => {
    const storage = storagePortMockFactory.create({
      [StorageKey.WORKSPACE_ORGANIZATION_ID]: '15',
      [StorageKey.WORKSPACE_PROJECT_ID]: '44',
    });
    const service = new PersistedWorkspaceSelectionAdapter(
      storage,
      organizationIdentifier,
      projectIdentifier,
    );

    const selection = service.restoreSelection();

    expect(selection).toEqual({
      organizationId: organizationIdentifier.parse(15),
      projectId: projectIdentifier.parse(44),
    });
  });

  it('returns null for invalid persisted identifier values', () => {
    const storage = storagePortMockFactory.create({
      [StorageKey.WORKSPACE_ORGANIZATION_ID]: 'abc',
      [StorageKey.WORKSPACE_PROJECT_ID]: '  ',
    });
    const service = new PersistedWorkspaceSelectionAdapter(
      storage,
      organizationIdentifier,
      projectIdentifier,
    );

    const selection = service.restoreSelection();

    expect(selection).toEqual({
      organizationId: null,
      projectId: null,
    });
  });

  it('clears the project selection when the organization changes', () => {
    const storage = storagePortMockFactory.create({
      [StorageKey.WORKSPACE_ORGANIZATION_ID]: '4',
      [StorageKey.WORKSPACE_PROJECT_ID]: '30',
    });
    const service = new PersistedWorkspaceSelectionAdapter(
      storage,
      organizationIdentifier,
      projectIdentifier,
    );

    service.setOrganizationId(organizationIdentifier.parse(6));

    expect(storage.setItem).toHaveBeenCalledWith(
      StorageKey.WORKSPACE_ORGANIZATION_ID,
      organizationIdentifier.parse(6),
    );
    expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.WORKSPACE_PROJECT_ID);
  });

  it('clears both workspace keys when the organization is reset', () => {
    const storage = storagePortMockFactory.create();
    const service = new PersistedWorkspaceSelectionAdapter(
      storage,
      organizationIdentifier,
      projectIdentifier,
    );

    service.setOrganizationId(null);

    expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.WORKSPACE_ORGANIZATION_ID);
    expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.WORKSPACE_PROJECT_ID);
  });
});
