import { describe, expect, it } from 'vitest';
import { MediaErrorCode } from '../../domain/media/enums/media-error-code.enum';
import { MediaAccessIssuerFixture } from '../../test-utils/fixtures/unit/media-storage.fixture';
import { PrismaMediaAccessIssuer } from './prisma-media-access-issuer';

describe('PrismaMediaAccessIssuer', () => {
  it('issues an ephemeral grant only for a ready asset attached to live quiz content', async () => {
    // Arrange
    const fixture = new MediaAccessIssuerFixture();
    const issuer = new PrismaMediaAccessIssuer(fixture.prisma, fixture.storage);

    // Act
    const grant = await issuer.issue(fixture.asset.id);

    // Assert
    expect(fixture.findFirst).toHaveBeenCalledExactlyOnceWith({
      where: {
        id: fixture.asset.id,
        status: 'ready',
        question: {
          is: {
            deletedAt: null,
            quiz: {
              deletedAt: null,
              game: {
                deletedAt: null,
                project: { deletedAt: null, organization: { deletedAt: null } },
              },
            },
          },
        },
      },
      select: { id: true, mimeType: true, objectKey: true },
    });
    expect(fixture.storage.signReadUrl).toHaveBeenCalledExactlyOnceWith(fixture.asset.objectKey);
    expect(grant).toEqual({ id: fixture.asset.id, mimeType: fixture.asset.mimeType, ...fixture.grant });
  });

  it('does not sign missing, detached, pending, retired, or soft-deleted content excluded by the live-asset query', async () => {
    // Arrange
    const fixture = new MediaAccessIssuerFixture();
    fixture.findFirst.mockResolvedValue(null);
    const issuer = new PrismaMediaAccessIssuer(fixture.prisma, fixture.storage);

    // Act
    const result = issuer.issue(fixture.asset.id);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.MEDIA_UNAVAILABLE);
    expect(fixture.storage.signReadUrl).not.toHaveBeenCalled();
  });
});
