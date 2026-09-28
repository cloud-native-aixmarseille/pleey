import { Buffer } from 'node:buffer';
import type { Prisma } from '@prisma/client';
import { vi } from 'vitest';
import type { PrismaService } from '../../../infrastructure/database/prisma-service';
import { MediaLifecycleFixture } from './media-lifecycle.fixture';

export class LegacyMediaMigrationFixture extends MediaLifecycleFixture {
  readonly legacy = {
    id: '508c432d-8b38-445c-a00f-878a7d817f87',
    mimeType: 'image/png',
    content: Buffer.from('legacy-question-original'),
  };
  readonly questionId = '28963bd9-a0b9-412d-8cbc-a4c0b008d7e3';
  readonly transaction = {
    $queryRaw: vi.fn().mockResolvedValue([]),
    mediaAsset: this.ledger,
    question: {
      findUnique: vi.fn().mockResolvedValue({ legacyQuestionMediaId: this.legacy.id, mediaAssetId: null }),
      update: vi.fn().mockResolvedValue(undefined),
    },
    media: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
  };
  readonly questions = {
    findMany: vi
      .fn()
      .mockResolvedValueOnce([{ id: this.questionId, legacyMedia: this.legacy }])
      .mockResolvedValue([]),
  };
  readonly transact = vi.fn(async (callback: (transaction: Prisma.TransactionClient) => Promise<unknown>) =>
    callback(this.transaction as unknown as Prisma.TransactionClient),
  );
  override readonly prisma = { question: this.questions, $transaction: this.transact } as unknown as PrismaService;
}
