import type { UserId } from '../../auth/entities/user.entity';
import { Question, type QuestionId, type QuestionType } from '../../quiz/entities/question';
import { QuestionAnswer, type QuestionAnswerId } from '../../quiz/entities/question-answer';
import type { QuizId } from '../../quiz/entities/quiz';
import { GameErrorCode } from '../enums/game-error-code.enum';
import type { GameSessionId } from './game-session';
import type { PlayerAnswerProps } from './player-answer';
import { PlayerAnswer } from './player-answer';
import type { PlayerScoreProps } from './player-score';
import { PlayerScore } from './player-score';
import type { GuestId, PlayerStateProps } from './player-state';
import { PlayerState } from './player-state';

export interface QuestionSnapshot {
  id: QuestionId;
  quizId: QuizId;
  position: number;
  questionText: string;
  type: QuestionType;
  answers: Array<{
    id: QuestionAnswerId;
    text: string | null;
    position: number;
    isCorrect: boolean;
  }>;
  timeLimit: number;
  points: number;
}

export interface GameSessionStateSnapshot {
  sessionId: GameSessionId;
  quizId: QuizId;
  hostId: UserId;
  questions: QuestionSnapshot[];
  currentQuestionId: QuestionId | null;
  players: PlayerStateProps[];
  scores: PlayerScoreProps[];
  currentQuestionAnswers: PlayerAnswerProps[];
  questionStartTime?: number;
  pausedTimeLeft?: number;
}

export interface GameSessionStateProps {
  sessionId: GameSessionId;
  quizId: QuizId;
  hostId: UserId;
  questions: Question[];
  currentQuestionId?: QuestionId | null;
}

/**
 * Aggregate root for game session state.
 * Encapsulates all in-memory game state and enforces business rules.
 */
export class GameSessionState {
  readonly sessionId: GameSessionId;
  readonly quizId: QuizId;
  readonly hostId: UserId;
  readonly questions: Question[];

  private _currentQuestionId: QuestionId | null;
  private _players: Map<string, PlayerState>;
  private _scores: Map<string, PlayerScore>;
  private _currentQuestionAnswers: Map<string, PlayerAnswer>;
  private _questionStartTime?: number;
  private _pausedTimeLeft?: number;

  private constructor(props: GameSessionStateProps) {
    this.sessionId = props.sessionId;
    this.quizId = props.quizId;
    this.hostId = props.hostId;
    this.questions = props.questions;
    this._currentQuestionId = props.currentQuestionId ?? null;
    this._players = new Map();
    this._scores = new Map();
    this._currentQuestionAnswers = new Map();
  }

  static create(props: GameSessionStateProps): GameSessionState {
    return new GameSessionState(props);
  }

  static fromSnapshot(snapshot: GameSessionStateSnapshot): GameSessionState {
    const state = new GameSessionState({
      sessionId: snapshot.sessionId,
      quizId: snapshot.quizId,
      hostId: snapshot.hostId,
      questions: snapshot.questions.map(
        (q) =>
          new Question(
            q.id,
            q.quizId,
            q.position,
            q.questionText,
            q.type,
            q.answers.map(
              (answer) =>
                new QuestionAnswer(answer.id, q.id, answer.text, answer.position, answer.isCorrect),
            ),
            q.timeLimit,
            q.points,
          ),
      ),
      currentQuestionId: snapshot.currentQuestionId,
    });

    state._questionStartTime = snapshot.questionStartTime;
    state._pausedTimeLeft = snapshot.pausedTimeLeft;

    state._players = new Map(
      snapshot.players.map((playerProps) => [
        playerProps.socketId,
        PlayerState.create(playerProps),
      ]),
    );

    state._scores = new Map(
      snapshot.scores.map((scoreProps) => [scoreProps.playerId, PlayerScore.create(scoreProps)]),
    );

    state._currentQuestionAnswers = new Map(
      snapshot.currentQuestionAnswers.map((answerProps) => [
        answerProps.playerId,
        PlayerAnswer.create(answerProps),
      ]),
    );

    return state;
  }

  toSnapshot(): GameSessionStateSnapshot {
    return {
      sessionId: this.sessionId,
      quizId: this.quizId,
      hostId: this.hostId,
      questions: this.questions.map((q) => ({
        id: q.id,
        quizId: q.quizId,
        position: q.position,
        questionText: q.questionText,
        type: q.type,
        answers: q.answers.map((answer) => ({
          id: answer.id,
          text: answer.text,
          position: answer.position,
          isCorrect: answer.isCorrect,
        })),
        timeLimit: q.timeLimit,
        points: q.points,
      })),
      currentQuestionId: this._currentQuestionId,
      players: this.getAllPlayers().map((p) => {
        if (p.userId !== undefined) {
          return {
            socketId: p.socketId,
            username: p.username,
            avatarSeed: p.avatarSeed,
            userId: p.userId,
          };
        }
        if (p.guestId !== undefined) {
          return {
            socketId: p.socketId,
            username: p.username,
            avatarSeed: p.avatarSeed,
            guestId: p.guestId,
          };
        }
        throw new Error(GameErrorCode.PLAYER_IDENTITY_REQUIRED);
      }),
      scores: Array.from(this._scores.values()).map((s) => {
        if (s.userId !== undefined) {
          return {
            playerId: s.playerId,
            username: s.username,
            totalPoints: s.totalPoints,
            userId: s.userId,
          };
        }
        if (s.guestId !== undefined) {
          return {
            playerId: s.playerId,
            username: s.username,
            totalPoints: s.totalPoints,
            guestId: s.guestId,
          };
        }
        throw new Error(GameErrorCode.PLAYER_SCORE_IDENTITY_INVALID);
      }),
      currentQuestionAnswers: this.getAllAnswers().map((a) => ({
        playerId: a.playerId,
        answerId: a.answerId,
        isCorrect: a.isCorrect,
        points: a.points,
        timeLeft: a.timeLeft,
      })),
      questionStartTime: this._questionStartTime,
      pausedTimeLeft: this._pausedTimeLeft,
    };
  }

  // Getters
  get currentQuestionId(): QuestionId | null {
    return this._currentQuestionId;
  }

  get currentQuestion(): Question | undefined {
    if (!this._currentQuestionId) {
      return undefined;
    }
    return this.questions.find((question) => question.id === this._currentQuestionId);
  }

  get questionStartTime(): number | undefined {
    return this._questionStartTime;
  }

  get pausedTimeLeft(): number | undefined {
    return this._pausedTimeLeft;
  }

  get hasMoreQuestions(): boolean {
    if (this.questions.length === 0) {
      return false;
    }
    const currentIndex = this.getCurrentQuestionIndex();
    if (currentIndex < 0) {
      return true;
    }
    return currentIndex + 1 < this.questions.length;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get hasQuestions(): boolean {
    return this.questions.length > 0;
  }

  // Player management
  addPlayer(player: PlayerState): void {
    // Remove existing player with same identity (reconnection)
    const existingSocketId = this.findExistingPlayerSocketId(player);
    if (existingSocketId) {
      this._players.delete(existingSocketId);
    }
    this._players.set(player.socketId, player);
  }

  removePlayerBySocketId(socketId: string): boolean {
    return this._players.delete(socketId);
  }

  getPlayerBySocketId(socketId: string): PlayerState | undefined {
    return this._players.get(socketId);
  }

  findPlayerByUserId(userId: UserId): PlayerState | undefined {
    for (const player of this._players.values()) {
      if (player.matchesUserId(userId)) {
        return player;
      }
    }
    return undefined;
  }

  findPlayerByGuestId(guestId: GuestId): PlayerState | undefined {
    for (const player of this._players.values()) {
      if (player.matchesGuestId(guestId)) {
        return player;
      }
    }
    return undefined;
  }

  findPlayerByIdentity(userId?: UserId, guestId?: GuestId): PlayerState | undefined {
    for (const player of this._players.values()) {
      if (userId !== undefined && player.matchesUserId(userId)) {
        return player;
      }
      if (guestId && player.matchesGuestId(guestId)) {
        return player;
      }
    }
    return undefined;
  }

  getNonHostPlayers(): PlayerState[] {
    return Array.from(this._players.values()).filter((player) => player.userId !== this.hostId);
  }

  getAllPlayers(): PlayerState[] {
    return Array.from(this._players.values());
  }

  getPlayerEntries(): [string, PlayerState][] {
    return Array.from(this._players.entries());
  }

  get playerCount(): number {
    return this._players.size;
  }

  isHost(userId?: UserId): boolean {
    return userId !== undefined && userId === this.hostId;
  }

  // Score management
  getOrCreateScore(
    playerId: string,
    username: string,
    identity: { userId: UserId; guestId?: never } | { userId?: never; guestId: GuestId },
  ): PlayerScore {
    let score = this._scores.get(playerId);
    if (!score) {
      score = PlayerScore.createNew(playerId, username, identity);
      this._scores.set(playerId, score);
    }
    return score;
  }

  getScoresExcludingHost(): PlayerScore[] {
    return Array.from(this._scores.values()).filter(
      (score) => score.userId === undefined || score.userId !== this.hostId,
    );
  }

  // Answer management
  hasPlayerAnswered(playerId: string): boolean {
    return this._currentQuestionAnswers.has(playerId);
  }

  recordAnswer(answer: PlayerAnswer): void {
    this._currentQuestionAnswers.set(answer.playerId, answer);
  }

  getAnswer(playerId: string): PlayerAnswer | undefined {
    return this._currentQuestionAnswers.get(playerId);
  }

  getAllAnswers(): PlayerAnswer[] {
    return Array.from(this._currentQuestionAnswers.values());
  }

  get answeredCount(): number {
    return this._currentQuestionAnswers.size;
  }

  haveAllNonHostPlayersAnswered(): boolean {
    const nonHostPlayers = this.getNonHostPlayers();
    return nonHostPlayers.length > 0 && this.answeredCount === nonHostPlayers.length;
  }

  // Question flow management
  startQuestion(): void {
    this._currentQuestionId = this.questions[0]?.id ?? null;
    this._currentQuestionAnswers.clear();
    this._questionStartTime = Date.now();
    this._pausedTimeLeft = undefined;
  }

  advanceToNextQuestion(): void {
    if (this.questions.length === 0) {
      this._currentQuestionId = null;
    } else {
      const currentIndex = this.getCurrentQuestionIndex();
      if (currentIndex < 0) {
        this._currentQuestionId = this.questions[0].id;
      } else if (currentIndex + 1 < this.questions.length) {
        this._currentQuestionId = this.questions[currentIndex + 1].id;
      }
    }
    this._currentQuestionAnswers.clear();
    this._questionStartTime = Date.now();
    this._pausedTimeLeft = undefined;
  }

  clearAnswersForNewQuestion(): void {
    this._currentQuestionAnswers.clear();
    this._questionStartTime = Date.now();
  }

  // Pause management
  pause(): number {
    const timeLimit = this.currentQuestion?.timeLimit ?? 20;
    let remainingTime = timeLimit;

    if (this._questionStartTime) {
      const elapsedSeconds = Math.floor((Date.now() - this._questionStartTime) / 1000);
      remainingTime = Math.max(0, timeLimit - elapsedSeconds);
    }

    this._pausedTimeLeft = remainingTime;
    return remainingTime;
  }

  resume(): number {
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) {
      throw new Error(GameErrorCode.NO_CURRENT_QUESTION_TO_RESUME);
    }

    const remainingTime = this._pausedTimeLeft ?? currentQuestion.timeLimit;

    // Recalculate question start time for accurate tracking
    this._questionStartTime = Date.now() - (currentQuestion.timeLimit - remainingTime) * 1000;
    this._pausedTimeLeft = undefined;

    return remainingTime;
  }

  // Utility
  private findExistingPlayerSocketId(newPlayer: PlayerState): string | undefined {
    for (const [socketId, player] of this._players.entries()) {
      if (newPlayer.userId !== undefined && player.matchesUserId(newPlayer.userId)) {
        return socketId;
      }
      if (newPlayer.guestId && player.matchesGuestId(newPlayer.guestId)) {
        return socketId;
      }
    }
    return undefined;
  }

  private getCurrentQuestionIndex(): number {
    if (!this._currentQuestionId) {
      return -1;
    }
    return this.questions.findIndex((question) => question.id === this._currentQuestionId);
  }
}
