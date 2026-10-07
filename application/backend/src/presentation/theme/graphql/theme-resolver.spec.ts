import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { ThemeResolverFixtureFactory } from '../../../test-utils/fixtures/theme-resolver-fixture-factory';
import type { ListThemesInput } from './theme-types';

const organizationId = backendTestIdentifiers.organization(1);
const userId = backendTestIdentifiers.user(1);
const fixtures = new ThemeResolverFixtureFactory();

describe('ThemeResolver', () => {
  it.each([undefined, { page: 2, pageSize: 10, search: 'Meetup' }])(
    'passes list input %j and identity to its use case',
    async (input) => {
      // Arrange
      const { resolver, list } = fixtures.create();
      // Act
      await resolver.listThemes(organizationId, input as ListThemesInput, { req: { user: { id: userId } } });
      // Assert
      expect(list.execute).toHaveBeenCalledWith(organizationId, userId, input ?? {});
    },
  );

  it('passes the document, selected theme, and revision to the save use case', async () => {
    // Arrange
    const { resolver, save } = fixtures.create();
    const theme = new ThemeFixtureFactory().createManagedTheme();
    save.execute.mockResolvedValue(theme);
    // Act
    const result = await resolver.saveTheme(
      organizationId,
      { document: theme.document, themeId: theme.id, expectedRevision: theme.revision },
      { user: { id: userId } },
    );
    // Assert
    expect(save.execute).toHaveBeenCalledWith(organizationId, userId, theme.document, theme.id, theme.revision);
    expect(result).toEqual(theme);
  });

  it('passes a lazy upload source to the upload use case', async () => {
    // Arrange
    const { resolver, upload } = fixtures.create();
    const createReadStream = vi.fn(() => Readable.from([Buffer.from('image')]));
    const file = Promise.resolve({ mimetype: 'image/png', createReadStream });
    // Act
    await resolver.uploadThemeAsset(organizationId, file, { user: { id: userId } });
    // Assert
    expect(upload.execute).toHaveBeenCalledWith(
      organizationId,
      userId,
      expect.objectContaining({ read: expect.any(Function) }),
    );
    expect(createReadStream).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests before invoking application behavior', () => {
    // Arrange
    const { resolver, save } = fixtures.create();
    const document = new ThemeFixtureFactory().createDocument();
    // Act + Assert
    expect(() => resolver.saveTheme(organizationId, { document }, {})).toThrow(IdentityErrorCode.UNAUTHORIZED);
    expect(save.execute).not.toHaveBeenCalled();
  });
});
