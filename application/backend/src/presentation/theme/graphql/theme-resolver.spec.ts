import { Readable } from 'node:stream';
import { ValidationPipe } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { ThemeResolverFixtureFactory } from '../../../test-utils/fixtures/theme-resolver-fixture-factory';
import { ThemeResolver } from './theme-resolver';
import type { ListThemesInput } from './theme-types';

const organizationId = backendTestIdentifiers.organization(1);
const userId = backendTestIdentifiers.user(1);
const fixtures = new ThemeResolverFixtureFactory();

describe('ThemeResolver', () => {
  it('preserves upload streams through the application validation pipe', async () => {
    // Arrange
    const { resolver, upload } = fixtures.create();
    const createReadStream = vi.fn(() => Readable.from([Buffer.from('image')]));
    const file = Promise.resolve({ filename: 'logo.png', mimetype: 'image/png', createReadStream });
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
    const types = Reflect.getMetadata('design:paramtypes', ThemeResolver.prototype, 'uploadThemeAsset');
    // Act
    const validated = await pipe.transform(file, { type: 'body', metatype: types[1], data: 'file' });
    await resolver.uploadThemeAsset(organizationId, validated, { user: { id: userId } });
    const source = upload.execute.mock.calls[0][2];
    const content = await source.read();
    // Assert
    expect(content).toEqual({ content: Buffer.from('image'), mimeType: 'image/png' });
  });

  it('delegates management access checks with the authenticated identity', async () => {
    // Arrange
    const { resolver, access } = fixtures.create();
    // Act
    await resolver.themePermissions(organizationId, { req: { user: { id: userId } } });
    // Assert
    expect(access.execute).toHaveBeenCalledWith(organizationId, userId);
  });

  it('loads a theme using its organization, id, and authenticated identity', async () => {
    // Arrange
    const { resolver, get } = fixtures.create();
    const theme = new ThemeFixtureFactory().createManagedTheme();
    get.execute.mockResolvedValue(theme);
    // Act
    const result = await resolver.theme(organizationId, theme.id, { user: { id: userId } });
    // Assert
    expect(get.execute).toHaveBeenCalledWith(organizationId, userId, theme.id);
    expect(result).toEqual(theme);
  });

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
    const file = Promise.resolve({ filename: 'logo.png', mimetype: 'image/png', createReadStream });
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
