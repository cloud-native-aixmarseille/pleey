import type { PrismaService } from '../../../infrastructure/database/prisma-service';

export async function createPlayableContentPageFixture(prisma: PrismaService, kind: 'quiz' | 'prediction') {
  const organization = await prisma.organization.create({ data: { name: 'Pagination integration' } });
  const project = await prisma.project.create({
    data: { name: 'Pagination project', organizationId: organization.id },
  });
  const game = await prisma.game.create({ data: { title: 'Pagination game', type: kind, projectId: project.id } });
  const parent =
    kind === 'quiz'
      ? await prisma.quiz.create({ data: { gameId: game.id } })
      : await prisma.prediction.create({ data: { gameId: game.id } });
  const entries = Array.from({ length: 6 }, (_, position) => ({
    position,
    deletedAt: position === 5 ? new Date() : null,
  }));
  if (kind === 'quiz') {
    await prisma.question.createMany({
      data: entries.map((entry) => ({
        ...entry,
        quizId: parent.id,
        questionText: `Question ${entry.position}`,
        type: 'multiple',
      })),
    });
  } else {
    await prisma.predictionPrompt.createMany({
      data: entries.map((entry) => ({ ...entry, predictionId: parent.id, promptText: `Prompt ${entry.position}` })),
    });
  }
  return {
    id: parent.id,
    gameId: game.id,
    cleanup: async () => {
      if (kind === 'quiz') await prisma.quiz.delete({ where: { id: parent.id } });
      else await prisma.prediction.delete({ where: { id: parent.id } });
      await prisma.game.delete({ where: { id: game.id } });
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.organization.delete({ where: { id: organization.id } });
    },
  };
}
