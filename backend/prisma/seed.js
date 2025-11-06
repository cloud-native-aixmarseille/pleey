const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user (idempotent)
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@quiz.com" },
    update: {
      username: "admin",
      password: adminPassword,
      isAdmin: true,
    },
    create: {
      username: "admin",
      email: "admin@quiz.com",
      password: adminPassword,
      isAdmin: true,
    },
  });

  // Create a test player
  const playerPassword = await bcrypt.hash("player123", 10);
  const player = await prisma.user.upsert({
    where: { email: "player@quiz.com" },
    update: {
      username: "player1",
      password: playerPassword,
      isAdmin: false,
    },
    create: {
      username: "player1",
      email: "player@quiz.com",
      password: playerPassword,
      isAdmin: false,
    },
  });

  // Ensure default organization exists
  const organizationName = "Arcade Labs";
  let organization = await prisma.organization.findFirst({
    where: { name: organizationName },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: organizationName,
        description: "Default organization for local development",
      },
    });
  }

  // Ensure organization memberships
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: admin.id,
      },
    },
    update: { role: "owner" },
    create: {
      organizationId: organization.id,
      userId: admin.id,
      role: "owner",
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: player.id,
      },
    },
    update: { role: "member" },
    create: {
      organizationId: organization.id,
      userId: player.id,
      role: "member",
    },
  });

  // Create a sample quiz
  const quizTitle = "General Knowledge - Sample";
  let quiz = await prisma.quiz.findFirst({
    where: { title: quizTitle, organizationId: organization.id },
  });

  if (!quiz) {
    quiz = await prisma.quiz.create({
      data: {
        title: quizTitle,
        description: "A short sample quiz for local development",
        createdBy: { connect: { id: admin.id } },
        organization: { connect: { id: organization.id } },
      },
    });
  } else {
    quiz = await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        description: "A short sample quiz for local development",
        createdBy: { connect: { id: admin.id } },
        organization: { connect: { id: organization.id } },
      },
    });
  }

  // Add questions (idempotent by question text + quiz)
  const questionsData = [
    {
      questionText: "What is the capital of France?",
      type: "multiple",
      correctAnswer: "Paris",
      optionA: "Paris",
      optionB: "Berlin",
      optionC: "Madrid",
      optionD: "Rome",
      timeLimit: 20,
      points: 1000,
    },
    {
      questionText: "The earth is flat.",
      type: "truefalse",
      correctAnswer: "false",
      timeLimit: 10,
      points: 500,
    },
  ];

  for (const q of questionsData) {
    const existing = await prisma.question.findFirst({
      where: { questionText: q.questionText, quizId: quiz.id },
    });

    if (!existing) {
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          questionText: q.questionText,
          type: q.type,
          correctAnswer: q.correctAnswer,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          timeLimit: q.timeLimit,
          points: q.points,
        },
      });
    }
  }

  // Ensure we have the questions in memory
  const questions = await prisma.question.findMany({
    where: { quizId: quiz.id },
  });

  // Create a game session (finished status so it doesn't block new sessions)
  const sessionPin = "123456";
  const session = await prisma.gameSession.upsert({
    where: { pin: sessionPin },
    update: {
      status: "finished",
      quiz: { connect: { id: quiz.id } },
      admin: { connect: { id: admin.id } },
      organization: { connect: { id: organization.id } },
    },
    create: {
      quiz: { connect: { id: quiz.id } },
      admin: { connect: { id: admin.id } },
      organization: { connect: { id: organization.id } },
      pin: sessionPin,
      status: "finished",
    },
  });

  // Create a couple of scores for the player
  const firstQuestion = questions[0];
  if (firstQuestion) {
    await prisma.score.createMany({
      data: [
        {
          sessionId: session.id,
          userId: player.id,
          questionId: firstQuestion.id,
          points: firstQuestion.points,
          answerTime: 5,
          isCorrect: true,
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
