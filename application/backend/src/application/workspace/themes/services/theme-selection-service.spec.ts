import { describe, expect, it } from 'vitest';
import { ThemeErrorCode } from '../../../../domain/theme/errors/theme-error';
import { ThemeDocumentNormalizer } from '../../../../domain/theme/services/theme-document-normalizer';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { ThemeFixtureFactory } from '../../../../test-utils/fixtures/theme-fixture-factory';
import { ThemeRepositoryMockFactory } from '../../../../test-utils/mock-factories/theme-repository-mock-factory';
import { ThemeSelectionService } from './theme-selection-service';

const organizationId = backendTestIdentifiers.organization(1);
const fixtures = new ThemeFixtureFactory();

describe('ThemeSelectionService', () => {
  it.each([
    {
      source: 'party override',
      selection: {
        organizationDefaultThemeId: 'custom:01900000-0000-7000-8000-000000000001',
        projectDefaultThemeId: 'cyber-arcade',
        themeIdOverride: 'solar-grid',
      },
      expected: 'solar-grid',
    },
    {
      source: 'project default when the override inherits',
      selection: {
        organizationDefaultThemeId: 'custom:01900000-0000-7000-8000-000000000001',
        projectDefaultThemeId: 'solar-grid',
        themeIdOverride: null,
      },
      expected: 'solar-grid',
    },
    {
      source: 'explicit built-in override',
      selection: {
        organizationDefaultThemeId: 'solar-grid',
        projectDefaultThemeId: 'solar-grid',
        themeIdOverride: 'cyber-arcade',
      },
      expected: 'cyber-arcade',
    },
    {
      source: 'project default when the override is omitted',
      selection: { organizationDefaultThemeId: 'cyber-arcade', projectDefaultThemeId: 'solar-grid' },
      expected: 'solar-grid',
    },
    {
      source: 'organization default when the project inherits',
      selection: { organizationDefaultThemeId: 'solar-grid', projectDefaultThemeId: null },
      expected: 'solar-grid',
    },
    {
      source: 'built-in default when every selection inherits',
      selection: { organizationDefaultThemeId: null, projectDefaultThemeId: null, themeIdOverride: null },
      expected: 'cyber-arcade',
    },
    { source: 'built-in default when selections are omitted', selection: {}, expected: 'cyber-arcade' },
  ] as const)(
    'returns the document from the $source without looking up unused themes',
    async ({ selection, expected }) => {
      // Arrange
      const repository = new ThemeRepositoryMockFactory().create();
      const service = new ThemeSelectionService(repository);

      // Act
      const result = await service.resolve(organizationId, selection);

      // Assert
      expect(result.baseThemeId).toBe(expected);
      expect(repository.findById).not.toHaveBeenCalled();
    },
  );

  it.each([
    { id: 'cyber-arcade', name: 'Cyber Arcade' },
    { id: 'solar-grid', name: 'Solar Grid' },
  ] as const)('resolves $id to a valid document without a library lookup', async ({ id, name }) => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const service = new ThemeSelectionService(repository);

    // Act
    const result = await service.resolve(organizationId, { themeIdOverride: id });

    // Assert
    expect(result).toEqual({ schemaVersion: 1, baseThemeId: id, name, overrides: {} });
    expect(new ThemeDocumentNormalizer().normalize(result)).toEqual(result);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it.each(['themeIdOverride', 'projectDefaultThemeId', 'organizationDefaultThemeId'] as const)(
    'resolves a custom %s to its saved document within the organization',
    async (source) => {
      // Arrange
      const repository = new ThemeRepositoryMockFactory().create();
      const theme = fixtures.createManagedTheme({
        document: fixtures.createDocument({ baseThemeId: 'solar-grid', overrides: { radius: { panel: '12px' } } }),
      });
      repository.findById.mockResolvedValue(theme);
      const service = new ThemeSelectionService(repository);

      // Act
      const result = await service.resolve(organizationId, { [source]: theme.id });

      // Assert
      expect(result).toEqual(theme.document);
      expect(repository.findById).toHaveBeenCalledWith(organizationId, theme.id);
    },
  );

  it('rejects selection of a custom theme outside the organization', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const service = new ThemeSelectionService(repository);

    // Act + Assert
    await expect(
      service.resolve(organizationId, {
        themeIdOverride: 'custom:01900000-0000-7000-8000-000000000001',
        projectDefaultThemeId: 'solar-grid',
      }),
    ).rejects.toThrow(ThemeErrorCode.INVALID_SELECTION);
  });
});
