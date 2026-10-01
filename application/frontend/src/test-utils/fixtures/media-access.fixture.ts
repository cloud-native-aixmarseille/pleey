import { vi } from 'vitest';
import type { MediaAccessGrant } from '../../domains/media/ports/media-access.port';

export function createMediaAccessFixture() {
  const initial: MediaAccessGrant = {
    id: 'asset-1',
    mimeType: 'image/webp',
    uri: 'https://media.example/asset-1?old',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  };
  const renewed: MediaAccessGrant = {
    ...initial,
    uri: 'https://media.example/asset-1?renewed',
    expiresAt: new Date(Date.now() + 360_000).toISOString(),
  };
  const access = { renew: vi.fn().mockResolvedValue(renewed) };
  return { initial, renewed, access };
}
