import { OrganizationPermissionReason } from '@pleey/contracts/organization';
import type { ThemeDocument, ThemePermissions } from '@pleey/contracts/theme';
import type { ManagedTheme } from '../../domains/theme/entities/managed-theme';
import { OrganizationFixtureFactory } from './organization-fixture-factory';
export class ThemeFixtureFactory {
  createPermissions(allowed = true): ThemePermissions {
    const decision = allowed
      ? { allowed: true as const, reason: null }
      : { allowed: false as const, reason: OrganizationPermissionReason.INSUFFICIENT_PERMISSIONS };
    return { read: { allowed: true, reason: null }, create: decision, update: decision, uploadAsset: decision };
  }

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
