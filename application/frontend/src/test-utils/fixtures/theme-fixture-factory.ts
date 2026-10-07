import type { ManagedTheme } from '../../domains/theme/entities/managed-theme';
import type { ThemeDocument } from '../../domains/theme/entities/theme-document';
import { OrganizationFixtureFactory } from './organization-fixture-factory';
export class ThemeFixtureFactory {
  createManagedTheme(overrides: Partial<ManagedTheme> = {}): ManagedTheme {
    return {
      id: 'custom:01900000-0000-7000-8000-000000000001',
      organizationId: new OrganizationFixtureFactory().createOrganization().id,
      revision: 2,
      document: this.createDocument(),
      createdAt: '2026-10-07T00:00:00.000Z',
      updatedAt: '2026-10-07T00:00:00.000Z',
      ...overrides,
    };
  }

  createDocument(overrides: Partial<ThemeDocument> = {}): ThemeDocument {
    return { schemaVersion: 1, baseThemeId: 'cyber-arcade', name: 'Meetup', overrides: {}, ...overrides };
  }
}
