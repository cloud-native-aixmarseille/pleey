import { Question } from '../../quiz/entities/question';
import type { PlayerAnswerProps } from './player-answer';
import { PlayerAnswer } from './player-answer';
import type { PlayerScoreProps } from './player-score';
import { PlayerScore } from './player-score';
import type { PlayerStateProps } from './player-state';
import { PlayerState } from './player-state';

export interface QuestionSnapshot {
  id: number;
  quizId: number;
  questionText: string;
  type: 'multiple' | 'truefalse';
  correctAnswer: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  timeLimit: number;
  points: number;
}

export interface GameSessionStateSnapshot {
  sessionId: number;
  quizId: number;
  hostId: number;
  questions: QuestionSnapshot[];
  currentQuestionIndex: number;
  players: PlayerStateProps[];
  scores: PlayerScoreProps[];
  currentQuestionAnswers: PlayerAnswerProps[];
  questionStartTime?: number;
  pausedTimeLeft?: number;
}

export interface GameSessionStateProps {
  sessionId: number;
  quizId: number;
  hostId: number;
  questions: Question[];
  currentQuestionIndex?: number;
}

/**
 * Aggregate root for game session state.
 * Encapsulates all in-memory game state and enforces business rules.
 */
export class GameSessionState {
  readonly sessionId: number;
  readonly quizId: number;
  readonly hostId: number;
  readonly questions: Question[];

  private _currentQuestionIndex: number;
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
    this._currentQuestionIndex = props.currentQuestionIndex ?? 0;
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
            q.questionText,
            q.type,
            q.correctAnswer,
            q.optionA,
            q.optionB,
            q.optionC,
            q.optionD,
            q.timeLimit,
            q.points,
          ),
      ),
      currentQuestionIndex: snapshot.currentQuestionIndex,
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
        questionText: q.questionText,
        type: q.type,
        correctAnswer: q.correctAnswer,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        timeLimit: q.timeLimit,
        points: q.points,
      })),
      currentQuestionIndex: this._currentQuestionIndex,
      players: this.getAllPlayers().map((p) => ({
        socketId: p.socketId,
        userId: p.userId,
        guestId: p.guestId,
        username: p.username,
        avatarSeed: p.avatarSeed,
        isGuest: p.isGuest,
      })),
      scores: Array.from(this._scores.values()).map((s) => ({
        playerId: s.playerId,
        username: s.username,
        totalPoints: s.totalPoints,
        isGuest: s.isGuest,
      })),
      currentQuestionAnswers: this.getAllAnswers().map((a) => ({
        playerId: a.playerId,
        answer: a.answer,
        isCorrect: a.isCorrect,
        points: a.points,
        timeLeft: a.timeLeft,
      })),
      questionStartTime: this._questionStartTime,
      pausedTimeLeft: this._pausedTimeLeft,
    };
  }

  // Getters
  get currentQuestionIndex(): number {
    return this._currentQuestionIndex;
  }

  get currentQuestion(): Question | undefined {
    return this.questions[this._currentQuestionIndex];
  }

  get questionStartTime(): number | undefined {
    return this._questionStartTime;
  }

  get pausedTimeLeft(): number | undefined {
    return this._pausedTimeLeft;
  }

  get hasMoreQuestions(): boolean {
    return this._currentQuestionIndex + 1 < this.questions.length;
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

  findPlayerByUserId(userId: number): PlayerState | undefined {
    for (const player of this._players.values()) {
      if (player.matchesUserId(userId)) {
        return player;
      }
    }
    return undefined;
  }

  findPlayerByGuestId(guestId: string): PlayerState | undefined {
    for (const player of this._players.values()) {
      if (player.matchesGuestId(guestId)) {
        return player;
      }
    }
    return undefined;
  }

  findPlayerByIdentity(userId?: number, guestId?: string): PlayerState | undefined {
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

  isHost(userId?: number): boolean {
    return userId !== undefined && userId === this.hostId;
  }

  // Score management
  getOrCreateScore(playerId: string, username: string, isGuest: boolean): PlayerScore {
    let score = this._scores.get(playerId);
    if (!score) {
      score = PlayerScore.createNew(playerId, username, isGuest);
      this._scores.set(playerId, score);
    }
    return score;
  }

  getScoresExcludingHost(): PlayerScore[] {
    return Array.from(this._scores.values()).filter((score) => {
      const userId = this.extractUserIdFromPlayerId(score.playerId);
      return userId !== this.hostId;
    });
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
    this._currentQuestionIndex = 0;
    this._currentQuestionAnswers.clear();
    this._questionStartTime = Date.now();
    this._pausedTimeLeft = undefined;
  }

  advanceToNextQuestion(): void {
    this._currentQuestionIndex += 1;
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
      throw new Error('No current question to resume');
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

  private extractUserIdFromPlayerId(playerId: string): number | undefined {
    if (playerId.startsWith('user-')) {
      return Number.parseInt(playerId.substring(5), 10);
    }
    return undefined;
  }
}
