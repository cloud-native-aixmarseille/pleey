import { vi } from 'vitest';
import type { PlayerScore } from '../../../domain/game/entities/player-score';
import { QuestionType } from '../../../domain/quiz/entities/question';
import type { QuestionAnswerId } from '../../../domain/quiz/entities/question-answer';

export type GameSessionStateFixtureParams = {
  sessionId?: number;
  hasQuestions?: boolean;
  totalQuestions?: number;
  currentQuestion?: GameSessionStateQuestionFixture;
  startQuestion?: ReturnType<typeof vi.fn>;
  hasMoreQuestions?: boolean;
  currentQuestionId?: number;
  advanceToNextQuestion?: ReturnType<typeof vi.fn>;
  resume?: ReturnType<typeof vi.fn>;
  hasPlayerAnswered?: ReturnType<typeof vi.fn>;
  findPlayerByIdentity?: ReturnType<typeof vi.fn>;
  getOrCreateScore?: ReturnType<typeof vi.fn>;
  recordAnswer?: ReturnType<typeof vi.fn>;
  haveAllNonHostPlayersAnswered?: ReturnType<typeof vi.fn>;
  scores?: PlayerScore[];
  getScoresExcludingHost?: () => PlayerScore[];
};

type GameSessionStateQuestionFixture = {
  id: number;
  position: number;
  questionText: string;
  answers: Array<{
    id: QuestionAnswerId;
    text: string | null;
    position: number;
    isCorrect: boolean;
  }>;
  timeLimit: number;
  points: number;
  type: QuestionType;
};

type GameSessionStateStub = {
  sessionId: number;
  hasQuestions: boolean;
  totalQuestions: number;
  currentQuestion?: GameSessionStateQuestionFixture;
  startQuestion: ReturnType<typeof vi.fn>;
  hasMoreQuestions?: boolean;
  currentQuestionId?: number;
  advanceToNextQuestion?: ReturnType<typeof vi.fn>;
  resume?: ReturnType<typeof vi.fn>;
  hasPlayerAnswered?: ReturnType<typeof vi.fn>;
  findPlayerByIdentity?: ReturnType<typeof vi.fn>;
  getOrCreateScore?: ReturnType<typeof vi.fn>;
  recordAnswer?: ReturnType<typeof vi.fn>;
  haveAllNonHostPlayersAnswered?: ReturnType<typeof vi.fn>;
  getScoresExcludingHost: () => PlayerScore[];
};

export const createGameSessionStateFixture = (
  params: GameSessionStateFixtureParams = {},
): GameSessionStateStub => {
  const scores = params.scores ?? [];
  const hasQuestions = params.hasQuestions ?? true;
  const currentQuestion =
    params.currentQuestion ??
    (hasQuestions
      ? {
          id: 1,
          position: 0,
          questionText: 'Question? ',
          answers: [{ id: 1 as QuestionAnswerId, text: 'Answer', position: 0, isCorrect: true }],
          timeLimit: 10,
          points: 1000,
          type: QuestionType.MULTIPLE,
        }
      : undefined);

  return {
    sessionId: params.sessionId ?? 1,
    hasQuestions,
    totalQuestions: params.totalQuestions ?? (hasQuestions ? 1 : 0),
    currentQuestion,
    startQuestion: params.startQuestion ?? vi.fn(),
    hasMoreQuestions: params.hasMoreQuestions,
    currentQuestionId: params.currentQuestionId,
    advanceToNextQuestion: params.advanceToNextQuestion,
    resume: params.resume,
    hasPlayerAnswered: params.hasPlayerAnswered,
    findPlayerByIdentity: params.findPlayerByIdentity,
    getOrCreateScore: params.getOrCreateScore,
    recordAnswer: params.recordAnswer,
    haveAllNonHostPlayersAnswered: params.haveAllNonHostPlayersAnswered,
    getScoresExcludingHost: params.getScoresExcludingHost ?? (() => scores),
  };
};
