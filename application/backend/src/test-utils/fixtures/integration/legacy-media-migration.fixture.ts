import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import type { PrismaService } from '../../../infrastructure/database/prisma-service';
import { createMediaAssetRecordFixture } from '../unit/media-persistence.fixture';
import { createPlayableContentPageFixture } from './playable-content-page.fixture';

export async function createLegacyMediaMigrationFixture(prisma: PrismaService, sharedWithAvatar: boolean) {
  const page = await createPlayableContentPageFixture(prisma, 'quiz');
  const original = await prisma.media.create({
    data: { mimeType: 'image/png', content: Buffer.from('legacy-image-content') },
  });
  const question = await prisma.question.findFirstOrThrow({ where: { quizId: page.id, position: 0 } });
  await prisma.question.update({ where: { id: question.id }, data: { legacyQuestionMediaId: original.id } });
  const user = sharedWithAvatar
    ? await prisma.user.create({ data: { username: `avatar-migration-${randomUUID()}`, avatarMediaId: original.id } })
    : null;
  const asset = await prisma.mediaAsset.create({ data: createMediaAssetRecordFixture() });
  return {
    original,
    question,
    user,
    asset,
    cleanup: async () => {
      await page.cleanup();
      if (user) await prisma.user.delete({ where: { id: user.id } });
      await prisma.media.deleteMany({ where: { id: original.id } });
      await prisma.mediaAsset.deleteMany({ where: { id: asset.id } });
    },
  };
}
