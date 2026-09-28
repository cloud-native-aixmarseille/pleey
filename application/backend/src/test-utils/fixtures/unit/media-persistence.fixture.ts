import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';

export function createMediaAssetRecordFixture(
  overrides: Partial<Prisma.MediaAssetCreateInput> = {},
): Prisma.MediaAssetCreateInput {
  const id = randomUUID();
  return {
    id,
    objectKey: `quiz/${id}.webp`,
    uri: `https://cdn.example.test/quiz/${id}.webp`,
    mimeType: 'image/webp',
    byteSize: 100,
    width: 100,
    height: 100,
    status: 'pending',
    deleteAfter: new Date(Date.now() + 3600000),
    ...overrides,
  };
}
