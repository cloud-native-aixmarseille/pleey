import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { createGameSessionStateFixture } from '../../../test-utils/fixtures/unit';
import {
  createGameBroadcastServiceMock,
  createGameSessionStateServiceMock,
  createRevealAnswersUseCaseMock,
  createSubmitAnswerUseCaseMock,
} from '../../../test-utils/mock-factories';
import type { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { GameBroadcastEventType } from '../ports';
import { SubmitAnswerWsUseCase } from './submit-answer-ws.use-case';

describe('SubmitAnswerWsUseCase', () => {
  it('throws when no identity is provided', async () => {
    const state = createGameSessionStateFixture();
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const submitAnswerUseCase = createSubmitAnswerUseCaseMock();
    const revealAnswersUseCase = createRevealAnswersUseCaseMock();

    const useCase = new SubmitAnswerWsUseCase(
      gameSessionStateService as never,
      broadcastService as never,
      submitAnswerUseCase as never,
      revealAnswersUseCase as never,
    );

    await expect(
      useCase.execute('socket-1', {
        pin: '123456' as GameSessionPin,
        answerId: 1,
        timeLeft: 1,
      } satisfies SubmitAnswerDto),
    ).rejects.toBeInstanceOf(WsException);
  });

  it('throws ALREADY_ANSWERED when player already answered', async () => {
    const state = createGameSessionStateFixture({
      hasPlayerAnswered: vi.fn().mockReturnValue(true),
    });
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const submitAnswerUseCase = createSubmitAnswerUseCaseMock();
    const revealAnswersUseCase = createRevealAnswersUseCaseMock();

    const useCase = new SubmitAnswerWsUseCase(
      gameSessionStateService as never,
      broadcastService as never,
      submitAnswerUseCase as never,
      revealAnswersUseCase as never,
    );

    await expect(
      useCase.execute('socket-1', {
        pin: '123456' as GameSessionPin,
        answerId: 1,
        timeLeft: 1,
        userId: 1,
      } satisfies SubmitAnswerDto),
    ).rejects.toBeInstanceOf(WsException);

    try {
      await useCase.execute('socket-1', {
        pin: '123456' as GameSessionPin,
        answerId: 1,
        timeLeft: 1,
        userId: 1,
      } satisfies SubmitAnswerDto);
    } catch (error) {
      expect((error as WsException).getError()).toBe(GameErrorCode.ALREADY_ANSWERED);
    }
  });

  it('acknowledges answer and reveals when all players answered', async () => {
    const score = { addPoints: vi.fn() };

    const state = createGameSessionStateFixture({
      hasPlayerAnswered: vi.fn().mockReturnValue(false),
      findPlayerByIdentity: vi.fn().mockReturnValue({ username: 'alice', userId: 1 }),
      getOrCreateScore: vi.fn().mockReturnValue(score),
      recordAnswer: vi.fn(),
      haveAllNonHostPlayersAnswered: vi.fn().mockReturnValue(true),
    });

    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const submitAnswerUseCase = createSubmitAnswerUseCaseMock({
      execute: { isCorrect: true, points: 100 } as never,
    });
    const revealAnswersUseCase = createRevealAnswersUseCaseMock({ execute: undefined });

    const useCase = new SubmitAnswerWsUseCase(
      gameSessionStateService as never,
      broadcastService as never,
      submitAnswerUseCase as never,
      revealAnswersUseCase as never,
    );

    await useCase.execute('socket-1', {
      pin: '123456' as GameSessionPin,
      answerId: 1,
      timeLeft: 1,
      userId: 1,
    } satisfies SubmitAnswerDto);

    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: GameBroadcastEventType.ANSWER_ACKNOWLEDGED,
      connectionId: 'socket-1',
    });
    expect(score.addPoints).toHaveBeenCalledWith(100);
    expect(revealAnswersUseCase.execute).toHaveBeenCalledWith('123456' as GameSessionPin);
  });
});
