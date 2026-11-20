type PlayableManagementFixtureItem = {
  id: string;
  position: number;
  questionText: string;
  promptText: string;
  type: string;
  timeLimit: number;
  points: number;
  media: { mimeType: string; uri: string } | null;
  answers: never[];
  options: never[];
};

type PlayableManagementFixturePage = {
  items: PlayableManagementFixtureItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  overallCount: number;
  totalPages: number;
};

interface QuizManagementPageFixture {
  readonly gameTypeId: string;
  readonly firstResponse: {
    readonly quiz: {
      readonly quizId: string;
      readonly gameId: string;
      readonly title: string;
      readonly createdAt: string;
      readonly questionCount: number;
      readonly description?: string;
    };
    readonly quizQuestions: PlayableManagementFixturePage;
  };
  readonly nextResponse: {
    readonly quizQuestions: PlayableManagementFixturePage;
  };
}

interface PredictionManagementPageFixture {
  readonly gameTypeId: string;
  readonly firstResponse: {
    readonly prediction: {
      readonly predictionId: string;
      readonly gameId: string;
      readonly title: string;
      readonly createdAt: string;
      readonly promptCount: number;
      readonly description?: string;
    };
    readonly predictionPrompts: PlayableManagementFixturePage;
  };
  readonly nextResponse: {
    readonly predictionPrompts: PlayableManagementFixturePage;
  };
}

export class PlayableManagementPageFixtureFactory {
  create(kind: 'quiz'): QuizManagementPageFixture;
  create(kind: 'prediction'): PredictionManagementPageFixture;
  create(kind: 'quiz' | 'prediction') {
    const gameTypeId = '019f11f0-0000-7000-8000-000000000001';
    const gameId = '019f11f0-0000-7000-8000-000000000002';
    const firstItem: PlayableManagementFixtureItem = {
      id: '019f11f0-0000-7000-8000-000000000003',
      position: 0,
      questionText: 'First stage',
      promptText: 'First stage',
      type: 'MULTIPLE',
      timeLimit: 20,
      points: 100,
      media: null,
      answers: [],
      options: [],
    };
    const page: PlayableManagementFixturePage = {
      items: [firstItem],
      page: 1,
      pageSize: 1,
      totalCount: 2,
      overallCount: 2,
      totalPages: 2,
    };
    const nextPage: PlayableManagementFixturePage = {
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
    };

    if (kind === 'quiz') {
      return {
        gameTypeId,
        firstResponse: {
          quiz: {
            quizId: gameTypeId,
            gameId,
            title: 'Game',
            createdAt: '2026-09-10',
            questionCount: 2,
          },
          quizQuestions: page,
        },
        nextResponse: {
          quizQuestions: nextPage,
        },
      };
    }

    return {
      gameTypeId,
      firstResponse: {
        prediction: {
          predictionId: gameTypeId,
          gameId,
          title: 'Game',
          createdAt: '2026-09-10',
          promptCount: 2,
        },
        predictionPrompts: page,
      },
      nextResponse: {
        predictionPrompts: nextPage,
      },
    };
  }
}
