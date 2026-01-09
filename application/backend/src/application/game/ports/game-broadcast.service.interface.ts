import type { PlayerState } from '../../../domain/game/entities/player-state';
import type { Question } from '../../../domain/quiz/entities/question';

export const GameBroadcastServiceProvider = Symbol('GameBroadcastService');

export interface LeaderboardEntry {
  userId?: number;
  guestId?: string;
  username: string;
  totalPoints: number;
  rank: number;
  isGuest: boolean;
}

export interface AnswerStatistics {
  totalAnswers: number;
  answerDistribution: Record<string, number>;
}

export interface AnswerResultPayload {
  isCorrect: boolean;
  points: number;
  correctAnswer: string;
  statistics: AnswerStatistics;
}

export type GameBroadcastEvent =
  | {
      type: 'player-joined';
      pin: string;
      sessionId: number;
      players: PlayerState[];
    }
  | {
      type: 'game-started';
      pin: string;
      question: Question;
      questionNumber: number;
      totalQuestions: number;
    }
  | {
      type: 'next-question';
      pin: string;
      question: Question;
      questionNumber: number;
    }
  | {
      type: 'game-paused';
      pin: string;
      timeLeft: number;
    }
  | {
      type: 'game-resumed';
      pin: string;
      question: Question;
      questionNumber: number;
      totalQuestions: number;
      timeLeft: number;
    }
  | {
      type: 'game-ended';
      pin: string;
      leaderboard: LeaderboardEntry[];
    }
  | {
      type: 'answer-acknowledged';
      connectionId: string;
    }
  | {
      type: 'answer-result';
      connectionId: string;
      result: AnswerResultPayload;
    }
  | {
      type: 'leaderboard-updated';
      pin: string;
      leaderboard: LeaderboardEntry[];
    }
  | {
      type: 'game-state';
      connectionId: string;
      question: Question;
      questionNumber: number;
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
