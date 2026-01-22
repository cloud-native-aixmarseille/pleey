import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionId, GameSessionPin } from '../../../domain/game/entities/game-session';
import type { GuestId, PlayerState } from '../../../domain/game/entities/player-state';
import type { Question } from '../../../domain/quiz/entities/question';
import type { QuestionAnswerId } from '../../../domain/quiz/entities/question-answer';

export const GameBroadcastServiceProvider = Symbol('GameBroadcastService');

export enum GameBroadcastEventType {
  PLAYER_JOINED = 'player-joined',
  GAME_STARTED = 'game-started',
  NEXT_QUESTION = 'next-question',
  GAME_PAUSED = 'game-paused',
  GAME_RESUMED = 'game-resumed',
  GAME_ENDED = 'game-ended',
  ANSWER_ACKNOWLEDGED = 'answer-acknowledged',
  ANSWER_RESULT = 'answer-result',
  LEADERBOARD_UPDATED = 'leaderboard-updated',
  GAME_STATE = 'game-state',
}

type LeaderboardIdentity =
  | {
      userId: UserId;
      guestId?: never;
    }
  | {
      userId?: never;
      guestId: GuestId;
    };

export type LeaderboardEntry = LeaderboardIdentity & {
  username: string;
  totalPoints: number;
  rank: number;
};

export interface AnswerStatistics {
  totalAnswers: number;
  answerDistribution: Record<QuestionAnswerId, number>;
}

export interface AnswerResultPayload {
  isCorrect: boolean;
  points: number;
  correctAnswerIds: QuestionAnswerId[];
  statistics: AnswerStatistics;
}

export type GameBroadcastEvent =
  | {
      type: GameBroadcastEventType.PLAYER_JOINED;
      pin: GameSessionPin;
      sessionId: GameSessionId;
      players: PlayerState[];
    }
  | {
      type: GameBroadcastEventType.GAME_STARTED;
      pin: GameSessionPin;
      question: Question;
      totalQuestions: number;
    }
  | {
      type: GameBroadcastEventType.NEXT_QUESTION;
      pin: GameSessionPin;
      question: Question;
    }
  | {
      type: GameBroadcastEventType.GAME_PAUSED;
      pin: GameSessionPin;
      timeLeft: number;
    }
  | {
      type: GameBroadcastEventType.GAME_RESUMED;
      pin: GameSessionPin;
      question: Question;
      totalQuestions: number;
      timeLeft: number;
    }
  | {
      type: GameBroadcastEventType.GAME_ENDED;
      pin: GameSessionPin;
      leaderboard: LeaderboardEntry[];
    }
  | {
      type: GameBroadcastEventType.ANSWER_ACKNOWLEDGED;
      connectionId: string;
    }
  | {
      type: GameBroadcastEventType.ANSWER_RESULT;
      connectionId: string;
      result: AnswerResultPayload;
    }
  | {
      type: GameBroadcastEventType.LEADERBOARD_UPDATED;
      pin: GameSessionPin;
      leaderboard: LeaderboardEntry[];
    }
  | {
      type: GameBroadcastEventType.GAME_STATE;
      connectionId: string;
      question: Question;
      totalQuestions: number;
      timeLeft: number;
    };

/**
 * Outbound port used by game-related use-cases to notify clients.
 * Implemented by infrastructure (e.g., Socket.IO gateway adapter).
 */
export interface GameBroadcastService {
  publish(event: GameBroadcastEvent): void;
}
