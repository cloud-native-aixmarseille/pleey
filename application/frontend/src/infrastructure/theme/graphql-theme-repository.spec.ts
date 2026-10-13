import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { OrganizationActionDisabledReason } from '../../domains/organization/value-objects/organization-permissions';
import { GraphqlThemeRepositoryFixtureFactory } from '../../test-utils/fixtures/graphql-theme-repository-fixture-factory';
import { ThemeFixtureFactory } from '../../test-utils/fixtures/theme-fixture-factory';

const fixtures = new ThemeFixtureFactory();
describe('GraphqlThemeRepository', () => {
  it('preserves collection decisions and reasons even for an empty library', async () => {
    // Arrange
    const permissions = fixtures.createPermissions(false);
    const page = { items: [], page: 1, pageSize: 10, totalPages: 0, totalCount: 0, overallCount: 0, permissions };
    const { repository } = new GraphqlThemeRepositoryFixtureFactory().create({ listThemes: page });
    // Act
    const result = await repository.list(fixtures.createManagedTheme().organizationId, {});
    // Assert
    expect(result).toEqual(page);
  });

  it.each([
    null,
    {},
    { allowed: true },
    { allowed: true, reason: 'INSUFFICIENT_PERMISSIONS' },
    { allowed: false, reason: 'FUTURE_REASON' },
  ])('fails closed for missing or malformed decisions: %j', async (decision) => {
    // Arrange
    const { repository } = new GraphqlThemeRepositoryFixtureFactory().create({
      themePermissions: { create: decision },
    });
    // Act
    const result = await repository.permissions(fixtures.createManagedTheme().organizationId);
    // Assert
    const denied = { allowed: false, reason: OrganizationActionDisabledReason.UNAVAILABLE };
    expect(result).toEqual({ read: denied, create: denied, update: denied, uploadAsset: denied });
  });
});
