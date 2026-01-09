import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';
import {
  createGameBroadcastServiceMock,
  createSessionStateRepositoryMock,
} from '../../../test-utils/mock-factories';
import type { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { SubmitAnswerWsUseCase } from './submit-answer-ws.use-case';

describe('SubmitAnswerWsUseCase', () => {
  it('throws when no identity is provided', async () => {
    const sessionStateRepository = createSessionStateRepositoryMock({ getOrCreate: {} as never });
    const broadcastService = createGameBroadcastServiceMock();
    const submitAnswerUseCase = { execute: vi.fn() };
    const revealAnswersUseCase = { execute: vi.fn() };

    const useCase = new SubmitAnswerWsUseCase(
      sessionStateRepository as never,
      broadcastService as never,
      submitAnswerUseCase as never,
      revealAnswersUseCase as never,
    );

    await expect(
      useCase.execute('socket-1', {
        pin: '123456',
        answer: 'A',
        timeLeft: 1,
      } satisfies SubmitAnswerDto),
    ).rejects.toBeInstanceOf(WsException);
  });

  it('throws ALREADY_ANSWERED when player already answered', async () => {
    const state = {
      hasPlayerAnswered: vi.fn().mockReturnValue(true),
    };
    const sessionStateRepository = createSessionStateRepositoryMock({
      getOrCreate: state as never,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const submitAnswerUseCase = { execute: vi.fn() };
    const revealAnswersUseCase = { execute: vi.fn() };

    const useCase = new SubmitAnswerWsUseCase(
      sessionStateRepository as never,
      broadcastService as never,
      submitAnswerUseCase as never,
      revealAnswersUseCase as never,
    );

    await expect(
      useCase.execute('socket-1', {
        pin: '123456',
        answer: 'A',
        timeLeft: 1,
        userId: 1,
      } satisfies SubmitAnswerDto),
    ).rejects.toBeInstanceOf(WsException);

    try {
      await useCase.execute('socket-1', {
        pin: '123456',
        answer: 'A',
        timeLeft: 1,
        userId: 1,
      } satisfies SubmitAnswerDto);
    } catch (error) {
      expect((error as WsException).getError()).toBe(GameErrorCode.ALREADY_ANSWERED);
    }
  });

  it('acknowledges answer and reveals when all players answered', async () => {
    const score = { addPoints: vi.fn() };

    type SessionStateStub = {
      hasPlayerAnswered: (playerId: string) => boolean;
      findPlayerByIdentity: (
        userId?: number,
        guestId?: string,
      ) => { username: string; isGuest: boolean } | undefined;
      getOrCreateScore: (
        playerId: string,
        username: string,
        isGuest: boolean,
      ) => { addPoints: (points: number) => void };
      recordAnswer: (answer: unknown) => void;
      haveAllNonHostPlayersAnswered: () => boolean;
    };

    const state: SessionStateStub = {
      hasPlayerAnswered: vi.fn().mockReturnValue(false),
      findPlayerByIdentity: vi.fn().mockReturnValue({ username: 'alice', isGuest: false }),
      getOrCreateScore: vi.fn().mockReturnValue(score),
      recordAnswer: vi.fn(),
      haveAllNonHostPlayersAnswered: vi.fn().mockReturnValue(true),
    };

    const sessionStateRepository = createSessionStateRepositoryMock({
      getOrCreate: state as never,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const submitAnswerUseCase = {
      execute: vi.fn().mockResolvedValue({ isCorrect: true, points: 100 }),
    };
    const revealAnswersUseCase = { execute: vi.fn().mockResolvedValue(undefined) };

    const useCase = new SubmitAnswerWsUseCase(
      sessionStateRepository as never,
      broadcastService as never,
      submitAnswerUseCase as never,
      revealAnswersUseCase as never,
    );

    await useCase.execute('socket-1', {
      pin: '123456',
      answer: 'A',
      timeLeft: 1,
      userId: 1,
    } satisfies SubmitAnswerDto);

    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: 'answer-acknowledged',
      connectionId: 'socket-1',
    });
    expect(score.addPoints).toHaveBeenCalledWith(100);
    expect(revealAnswersUseCase.execute).toHaveBeenCalledWith('123456');
  });
});
