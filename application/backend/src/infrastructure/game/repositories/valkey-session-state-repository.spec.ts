import { Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ValkeySessionStateRepository } from './valkey-session-state-repository';

describe('ValkeySessionStateRepository', () => {
  it('returns undefined and removes snapshots with an invalid decoded shape', async () => {
    const repository = new ValkeySessionStateRepository(new Logger(), {
      ttlSeconds: 60,
      valkeyUrl: 'redis://localhost:6379',
    });
    const client = {
      get: vi.fn().mockResolvedValue(
        JSON.stringify({
          sessionId: 'not-a-number',
        }),
      ),
    };

    (
      repository as unknown as {
        getClient: () => Promise<typeof client>;
      }
    ).getClient = async () => client;

    const removeSpy = vi.spyOn(repository, 'remove').mockResolvedValue();

    await expect(repository.get('AB12CD' as never)).resolves.toBeUndefined();
    expect(removeSpy).toHaveBeenCalledWith('AB12CD');
  });
});
