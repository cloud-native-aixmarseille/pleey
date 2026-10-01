import type { PrismaService } from '../../../infrastructure/database/prisma-service';
import { createMediaAssetRecordFixture } from '../unit/media-persistence.fixture';
import { createPlayableContentPageFixture } from './playable-content-page.fixture';

export async function createMediaAccessFixture(prisma: PrismaService) {
  const page = await createPlayableContentPageFixture(prisma, 'quiz');
  const game = await prisma.game.findUniqueOrThrow({
    where: { id: page.gameId },
    select: { projectId: true, project: { select: { organizationId: true } } },
  });
  const asset = await prisma.mediaAsset.create({
    data: createMediaAssetRecordFixture({ status: 'ready', deleteAfter: null }),
  });
  const question = await prisma.question.findFirstOrThrow({ where: { quizId: page.id, position: 0 } });
  await prisma.question.update({ where: { id: question.id }, data: { mediaAssetId: asset.id } });
  return {
    asset,
    questionId: question.id,
    softDelete: async (target: 'question' | 'quiz' | 'game' | 'project' | 'organization') => {
      const data = { deletedAt: new Date() };
      switch (target) {
        case 'question':
          await prisma.question.update({ where: { id: question.id }, data });
          break;
        case 'quiz':
          await prisma.quiz.update({ where: { id: page.id }, data });
          break;
        case 'game':
          await prisma.game.update({ where: { id: page.gameId }, data });
          break;
        case 'project':
          await prisma.project.update({ where: { id: game.projectId }, data });
          break;
        case 'organization':
          await prisma.organization.update({ where: { id: game.project.organizationId }, data });
          break;
      }
    },
    cleanup: async () => {
      await page.cleanup();
      await prisma.mediaAsset.deleteMany({ where: { id: asset.id } });
    },
  };
}
