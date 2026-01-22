import type { UserId } from '../../auth/entities/user.entity';
import type { QuestionId } from '../../quiz/entities/question';
import type { QuizId } from '../../quiz/entities/quiz';
import type { GameSession, GameSessionId, GameSessionPin } from '../entities/game-session';
import type { GameSessionStatus } from '../enums/game-session-status.enum';

export const GameSessionRepositoryProvider = Symbol('GameSessionRepository');

/**
 * GameSession Repository Interface (Port)
 * Defines the contract for game session data access
 */
export interface GameSessionRepository {
  /**
   * Creates a new game session
   */
  create(quizId: QuizId, hostId: UserId, pin: GameSessionPin): Promise<GameSession>;

  /**
   * Finds a game session by PIN
   */
  findByPin(pin: GameSessionPin): Promise<GameSession | null>;

  /**
   * Finds a game session by ID
   */
  findById(id: GameSessionId): Promise<GameSession | null>;

  /**
   * Finds active or paused sessions for a specific host
   */
  findActiveByHostId(hostId: UserId): Promise<GameSession[]>;

  /**
   * Finds the active or paused session for a specific quiz
   */
  findActiveByQuizId(quizId: QuizId): Promise<GameSession | null>;

  /**
   * Finds all sessions for a specific quiz
   */
  findByQuizId(quizId: QuizId): Promise<GameSession[]>;

  /**
   * Updates game session status
   */
  updateStatus(id: GameSessionId, status: GameSessionStatus): Promise<GameSession>;

  /**
   * Updates current question
   */
  updateCurrentQuestion(id: GameSessionId, questionId: QuestionId | null): Promise<GameSession>;

  /**
   * Counts active or paused sessions by quiz ID
   */
  countActiveByQuizId(quizId: QuizId): Promise<number>;

  /**
   * Deletes old completed sessions
   */
  deleteOldSessions(olderThanDays: number): Promise<void>;
}
