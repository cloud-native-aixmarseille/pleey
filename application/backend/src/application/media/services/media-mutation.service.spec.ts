import { describe, expect, it, vi } from 'vitest';
import { MediaLifecycleFixture } from '../../../test-utils/fixtures/unit/media-lifecycle.fixture';
import { MediaMutationService } from './media-mutation.service';

describe('MediaMutationService', () => {
  it('passes only a successfully published asset to persistence', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    const save = vi.fn().mockResolvedValue('saved-question');
    const service = new MediaMutationService(fixture.publisher);

    // Act
    const result = await service.persist(fixture.media, save);

    // Assert
    expect(result).toBe('saved-question');
    expect(save).toHaveBeenCalledWith(fixture.asset);
    expect(fixture.publisher.discard).not.toHaveBeenCalled();
  });

  it('compensates a failed save and preserves the original database error', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    const failure = new Error('database write failed');
    const save = vi.fn().mockRejectedValue(failure);
    const service = new MediaMutationService(fixture.publisher);

    // Act
    const result = service.persist(fixture.media, save);

    // Assert
    await expect(result).rejects.toBe(failure);
    expect(fixture.publisher.discard).toHaveBeenCalledExactlyOnceWith(fixture.asset);
  });

  it('never attempts the database save when publication fails', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    fixture.publisher.publish.mockRejectedValue(new Error('storage unavailable'));
    const save = vi.fn();
    const service = new MediaMutationService(fixture.publisher);

    // Act
    const result = service.persist(fixture.media, save);

    // Assert
    await expect(result).rejects.toThrow('storage unavailable');
    expect(save).not.toHaveBeenCalled();
    expect(fixture.publisher.discard).not.toHaveBeenCalled();
  });

  it.each([null, undefined])('preserves the %s media intent without publishing', async (media) => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    const save = vi.fn().mockResolvedValue('saved-question');
    const service = new MediaMutationService(fixture.publisher);

    // Act
    await service.persist(media, save);

    // Assert
    expect(save).toHaveBeenCalledWith(media);
    expect(fixture.publisher.publish).not.toHaveBeenCalled();
  });
});
