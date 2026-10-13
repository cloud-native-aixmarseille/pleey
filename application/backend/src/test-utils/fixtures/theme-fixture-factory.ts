import type { ManagedTheme } from '../../domain/theme/entities/managed-theme';
import type { ThemeDocument } from '../../domain/theme/entities/theme-document';
import { backendTestIdentifiers } from '../branded-identifiers';
export class ThemeFixtureFactory {
  createManagedTheme(overrides: Partial<ManagedTheme> = {}): ManagedTheme {
    return {
      id: 'custom:01900000-0000-7000-8000-000000000001',
      organizationId: backendTestIdentifiers.organization(1),
      revision: 1,
      document: this.createDocument(),
      createdAt: new Date('2026-10-07T00:00:00.000Z'),
      updatedAt: new Date('2026-10-07T00:00:00.000Z'),
      ...overrides,
    };
  }

  createDocument(overrides: Partial<ThemeDocument> = {}): ThemeDocument {
    return { schemaVersion: 1, baseThemeId: 'cyber-arcade', name: 'Meetup', overrides: {}, ...overrides };
  }
}
