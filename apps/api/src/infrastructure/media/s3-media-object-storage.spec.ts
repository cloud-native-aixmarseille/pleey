import { PutObjectCommand } from '@aws-sdk/client-s3';
import { describe, expect, it } from 'vitest';
import { MediaErrorCode } from '../../domain/media/enums/media-error-code.enum';
import { MediaStorageFixture } from '../../test-utils/fixtures/unit/media-storage.fixture';

describe('S3MediaObjectStorage', () => {
  it('signs the browser-visible host, encoded path, no-store override, and bounded expiry without an origin request', async ({
    onTestFinished,
  }) => {
    // Arrange
    const fixture = new MediaStorageFixture();
    const startedAt = Math.floor(Date.now() / 1000) * 1000;
    onTestFinished(() => fixture.dispose());
    // Act
    const grant = await fixture.storage.signReadUrl('quiz/my image.webp');
    const url = new URL(grant.uri);

    // Assert
    expect(url.origin).toBe('https://delivery.example.test:8443');
    expect(url.pathname).toBe('/pleey-media/quiz/my%20image.webp');
    expect(url.searchParams.get('X-Amz-Algorithm')).toBe('AWS4-HMAC-SHA256');
    expect(url.searchParams.get('X-Amz-Credential')).toContain('/eu-west-1/s3/aws4_request');
    expect(url.searchParams.get('X-Amz-SignedHeaders')).toBe('host');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('300');
    expect(url.searchParams.get('X-Amz-Signature')).toMatch(/^[a-f0-9]{64}$/);
    expect(url.searchParams.get('response-cache-control')).toBe('private, no-store');
    expect(Date.parse(grant.expiresAt)).toBeGreaterThanOrEqual(startedAt + 300000);
    expect(Date.parse(grant.expiresAt)).toBeLessThanOrEqual(Date.now() + 300000);
    expect(fixture.send).not.toHaveBeenCalled();
  });

  it('stores optimized objects with private no-store cache metadata', async ({ onTestFinished }) => {
    // Arrange
    const fixture = new MediaStorageFixture();
    onTestFinished(() => fixture.dispose());
    // Act
    await fixture.storage.put('quiz/image.webp', fixture.processed);

    // Assert
    const command = fixture.send.mock.calls[0][0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: 'pleey-media',
      Key: 'quiz/image.webp',
      Body: fixture.processed.content,
      ContentType: 'image/webp',
      CacheControl: 'private, no-store',
    });
  });

  it('maps signer failure to a domain error without exposing credentials', async ({ onTestFinished }) => {
    // Arrange
    const fixture = new MediaStorageFixture({ publicBaseUrl: 'invalid-url' });
    onTestFinished(() => fixture.dispose());
    // Act
    const result = fixture.storage.signReadUrl('quiz/image.webp');

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.MEDIA_UNAVAILABLE);
  });
});
