import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  type QuestionRepository,
  QuestionRepositoryProvider,
} from '../../quiz/ports/question.repository';
import type { GameSessionPin } from '../entities/game-session';
import { GameSessionState } from '../entities/game-session-state';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameSessionStatus } from '../enums/game-session-status.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../ports/game-session.repository';
import {
  type SessionStateRepository,
  SessionStateRepositoryProvider,
} from '../ports/session-state.repository';

@Injectable()
export class GameSessionStateService {
  constructor(
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
  ) {}

  async getOrCreate(pin: GameSessionPin): Promise<GameSessionState> {
    const cached = await this.sessionStateRepository.get(pin);
    if (cached) {
      return cached;
    }

    const session = await this.gameSessionRepository.findByPin(pin);
    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (session.status === GameSessionStatus.ENDED) {
      throw new WsException(GameErrorCode.GAME_SESSION_ENDED);
    }

    const questions = await this.questionRepository.findByQuizId(session.quizId);

    const state = GameSessionState.create({
      sessionId: session.id,
      quizId: session.quizId,
      hostId: session.hostId,
      questions,
      currentQuestionId: session.currentQuestionId ?? null,
    });

    await this.update(pin, state);
    return state;
  }

  async get(pin: GameSessionPin): Promise<GameSessionState | undefined> {
    return this.sessionStateRepository.get(pin);
  }

  async update(pin: GameSessionPin, state: GameSessionState): Promise<void> {
    await this.sessionStateRepository.save(pin, state);
  }

  async remove(pin: GameSessionPin): Promise<void> {
    await this.sessionStateRepository.remove(pin);
  }

  async findPinBySocketId(socketId: string): Promise<GameSessionPin | undefined> {
    return this.sessionStateRepository.findPinBySocketId(socketId);
  }
}
