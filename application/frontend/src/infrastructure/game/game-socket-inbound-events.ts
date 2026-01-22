import type {
  AnswerResult,
  LeaderboardEntry,
  Player,
} from "../../domains/game/types";
import type { Question } from "../../domains/quiz/types";

export type GameSocketInboundEventMap = {
  error: { message?: string };
  "player-joined": { players: Player[] };
  "game-started": {
    question: Question;
    totalQuestions: number;
  };
  "game-resumed": {
    question: Question;
    totalQuestions: number;
    timeLeft?: number;
  };
  "game-paused": { timeLeft?: number };
  "answer-submitted": { acknowledged?: boolean } | undefined;
  "answer-result": AnswerResult;
  "next-question": { question: Question };
  "leaderboard-updated": { leaderboard: LeaderboardEntry[] };
  "game-ended": { leaderboard: LeaderboardEntry[] };
};

export type GameSocketInboundEventName = keyof GameSocketInboundEventMap;

export const GAME_SOCKET_INBOUND_EVENT = {
  ERROR: "error",
  PLAYER_JOINED: "player-joined",
  GAME_STARTED: "game-started",
  GAME_RESUMED: "game-resumed",
  GAME_PAUSED: "game-paused",
  ANSWER_SUBMITTED: "answer-submitted",
  ANSWER_RESULT: "answer-result",
  NEXT_QUESTION: "next-question",
  LEADERBOARD_UPDATED: "leaderboard-updated",
  GAME_ENDED: "game-ended",
} as const satisfies Record<string, GameSocketInboundEventName>;
