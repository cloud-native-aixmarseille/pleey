export class PlayableManagementPageFixtureFactory {
  create(kind: 'quiz' | 'prediction') {
    const gameTypeId = '019f11f0-0000-7000-8000-000000000001';
    const gameId = '019f11f0-0000-7000-8000-000000000002';
    const firstItem = {
      id: '019f11f0-0000-7000-8000-000000000003',
      position: 0,
      questionText: 'First stage',
      promptText: 'First stage',
      type: 'MULTIPLE',
      timeLimit: 20,
      points: 100,
      answers: [],
      options: [],
    };
    const field = kind === 'quiz' ? 'quizQuestions' : 'predictionPrompts';
    const page = { items: [firstItem], page: 1, pageSize: 1, totalCount: 2, overallCount: 2, totalPages: 2 };
    return {
      gameTypeId,
      firstResponse: {
        [kind]: {
          quizId: gameTypeId,
          predictionId: gameTypeId,
          gameId,
          title: 'Game',
          createdAt: '2026-09-10',
          questionCount: 2,
          promptCount: 2,
        },
        [field]: page,
      },
      nextResponse: {
        [field]: {
          ...page,
          page: 2,
          items: [
            {
              ...firstItem,
              id: '019f11f0-0000-7000-8000-000000000004',
              position: 1,
              questionText: 'Last stage',
              promptText: 'Last stage',
            },
          ],
        },
      },
    };
  }
}
