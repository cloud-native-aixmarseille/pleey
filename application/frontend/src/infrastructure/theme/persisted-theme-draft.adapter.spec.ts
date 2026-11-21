import { describe, expect, it, vi } from 'vitest';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { ThemeFixtureFactory } from '../../test-utils/fixtures/theme-fixture-factory';
import { StoragePortMockFactory } from '../../test-utils/mocks/storage-port-mock-factory';
import { PersistedThemeDraftAdapter } from './persisted-theme-draft.adapter';

const fixtures = new ThemeFixtureFactory();
const storageFactory = new StoragePortMockFactory();
const scope = { userId: 'user-1', organizationId: 'organization-1', themeId: 'new' };
describe('PersistedThemeDraftAdapter', () => {
  it('recovers incomplete edits and their source revision only in the matching scope', () => {
    // Arrange
    const adapter = new PersistedThemeDraftAdapter(storageFactory.create());
    const draft = {
      document: fixtures.createDocument({ name: '', overrides: { radius: { panel: '1' } } }),
      sourceRevision: 2,
      updatedAt: Date.now(),
    };
    // Act
    adapter.write(scope, draft);
    // Assert
    expect(adapter.read(scope)).toEqual(draft);
    expect(adapter.read({ ...scope, userId: 'other' })).toBeNull();
    expect(adapter.read({ ...scope, organizationId: 'other' })).toBeNull();
    expect(adapter.read({ ...scope, themeId: 'other' })).toBeNull();
  });
  it('discards expired drafts', () => {
    // Arrange
    const adapter = new PersistedThemeDraftAdapter(storageFactory.create());
    adapter.write(scope, {
      document: fixtures.createDocument(),
      sourceRevision: null,
      updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    });
    // Act
    const draft = adapter.read(scope);
    // Assert
    expect(draft).toBeNull();
  });
  it.each(['{not-json', 'null', '[]', '{"broken":{"document":{"schemaVersion":9}}}'])(
    'ignores malformed storage %s',
    (raw) => {
      // Arrange
      const adapter = new PersistedThemeDraftAdapter(storageFactory.create({ [StorageKey.THEME_DRAFTS]: raw }));
      // Act
      const draft = adapter.read(scope);
      // Assert
      expect(draft).toBeNull();
    },
  );
  it('does not interrupt editing when storage is unavailable', () => {
    // Arrange
    const storage = storageFactory.create();
    vi.mocked(storage.setItem).mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    const adapter = new PersistedThemeDraftAdapter(storage);
    // Act
    const persisted = adapter.write(scope, {
      document: fixtures.createDocument(),
      sourceRevision: null,
      updatedAt: Date.now(),
    });
    // Assert
    expect(persisted).toBe(false);
  });
  it('removes the requested draft while preserving another theme', () => {
    // Arrange
    const adapter = new PersistedThemeDraftAdapter(storageFactory.create());
    const draft = { document: fixtures.createDocument(), sourceRevision: null, updatedAt: Date.now() };
    adapter.write(scope, draft);
    adapter.write({ ...scope, themeId: 'other' }, draft);
    // Act
    adapter.remove(scope);
    // Assert
    expect(adapter.read(scope)).toBeNull();
    expect(adapter.read({ ...scope, themeId: 'other' })).toEqual(draft);
  });
});
