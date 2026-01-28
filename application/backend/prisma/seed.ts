import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

type SeedAnswer = {
  text: string;
  position: number;
  isCorrect: boolean;
};

type SeedQuestion = {
  questionText: string;
  type: 'multiple' | 'truefalse';
  answers: SeedAnswer[];
  timeLimit: number;
  points: number;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to run seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      email: 'admin@pleey.com',
      password: adminPassword,
    },
    create: {
      username: 'admin',
      email: 'admin@pleey.com',
      password: adminPassword,
    },
  });

  const playerPassword = await bcrypt.hash('player123', 10);
  const player = await prisma.user.upsert({
    where: { username: 'player1' },
    update: {
      email: 'player@pleey.com',
      password: playerPassword,
    },
    create: {
      username: 'player1',
      email: 'player@pleey.com',
      password: playerPassword,
    },
  });

  const organizationName = 'Arcade Labs';
  let organization = await prisma.organization.findFirst({
    where: { name: organizationName },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: organizationName,
        description: 'Default organization for local development',
      },
    });
  }

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: admin.id,
      },
    },
    update: { role: 'owner' },
    create: {
      organizationId: organization.id,
      userId: admin.id,
      role: 'owner',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: player.id,
      },
    },
    update: { role: 'member' },
    create: {
      organizationId: organization.id,
      userId: player.id,
      role: 'member',
    },
  });

  const projectName = 'Default';
  let project = await prisma.project.findFirst({
    where: {
      name: projectName,
      organizationId: organization.id,
      deletedAt: null,
    },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: projectName,
        description: 'Default project for local development',
        organizationId: organization.id,
      },
    });
  }

  const quizTitle = 'General Knowledge - Sample';
  const quizGameTitle = quizTitle;
  let quizGame = await prisma.game.findFirst({
    where: {
      type: 'quiz',
      title: quizGameTitle,
      projectId: project.id,
      deletedAt: null,
    },
  });

  if (!quizGame) {
    quizGame = await prisma.game.create({
      data: {
        type: 'quiz',
        title: quizGameTitle,
        description: 'A short sample quiz for local development',
        projectId: project.id,
      },
    });
  } else {
    quizGame = await prisma.game.update({
      where: { id: quizGame.id },
      data: {
        description: 'A short sample quiz for local development',
        projectId: project.id,
      },
    });
  }

  let quiz = await prisma.quiz.findFirst({
    where: { gameId: quizGame.id },
  });

  if (!quiz) {
    quiz = await prisma.quiz.create({
      data: {
        game: { connect: { id: quizGame.id } },
      },
    });
  } else {
    quiz = await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        game: { connect: { id: quizGame.id } },
      },
    });
  }

  const predictionTitle = 'Event Predictions - Sample';
  const existingPredictionGame = await prisma.game.findFirst({
    where: {
      type: 'prediction',
      title: predictionTitle,
      projectId: project.id,
      deletedAt: null,
    },
  });

  if (!existingPredictionGame) {
    await prisma.game.create({
      data: {
        type: 'prediction',
        title: predictionTitle,
        description: 'Sample prediction game for local development',
        projectId: project.id,
      },
    });
  }

  const questionsData: SeedQuestion[] = [
    {
      questionText: 'What is the capital of France?',
      type: 'multiple',
      answers: [
        { text: 'Paris', position: 0, isCorrect: true },
        { text: 'Berlin', position: 1, isCorrect: false },
        { text: 'Madrid', position: 2, isCorrect: false },
        { text: 'Rome', position: 3, isCorrect: false },
      ],
      timeLimit: 20,
      points: 1000,
    },
    {
      questionText: 'The earth is flat.',
      type: 'truefalse',
      answers: [
        { text: 'True', position: 0, isCorrect: false },
        { text: 'False', position: 1, isCorrect: true },
      ],
      timeLimit: 10,
      points: 500,
    },
  ];

  for (const q of questionsData) {
    const existing = await prisma.question.findFirst({
      where: { questionText: q.questionText, quizId: quiz.id },
    });

    if (!existing) {
      const createdQuestion = await prisma.question.create({
        data: {
          quizId: quiz.id,
          position: questionsData.findIndex((item) => item.questionText === q.questionText),
          questionText: q.questionText,
          type: q.type,
          timeLimit: q.timeLimit,
          points: q.points,
        },
      });

      await prisma.questionAnswer.createMany({
        data: q.answers.map((answer) => ({
          questionId: createdQuestion.id,
          text: answer.text,
          position: answer.position,
          isCorrect: answer.isCorrect,
        })),
      });
    }
  }

  const questions = await prisma.question.findMany({
    where: { quizId: quiz.id },
  });

  const sessionPin = '123456';
  const session = await prisma.gameSession.upsert({
    where: { pin: sessionPin },
    update: {
      status: 'waiting',
      gameId: quizGame.id,
      hostId: admin.id,
      context: Prisma.JsonNull,
    },
    create: {
      gameId: quizGame.id,
      hostId: admin.id,
      pin: sessionPin,
      status: 'waiting',
      context: Prisma.JsonNull,
    },
  });

  const firstQuestion = questions[0];
  if (firstQuestion) {
    await prisma.score.createMany({
      data: [
        {
          sessionId: session.id,
          userId: player.id,
          context: {
            questionId: firstQuestion.id,
            actionTime: 5,
            isCorrect: true,
            actedAt: new Date().toISOString(),
          },
          points: firstQuestion.points,
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
