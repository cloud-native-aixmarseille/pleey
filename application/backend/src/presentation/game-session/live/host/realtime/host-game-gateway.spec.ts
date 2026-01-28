import { Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdvanceGameStageUseCase } from '../../../../../application/game-session/live/host/use-cases/advance-game-stage-use-case';
import { EndGameUseCase } from '../../../../../application/game-session/live/host/use-cases/end-game-use-case';
import { PauseGameUseCase } from '../../../../../application/game-session/live/host/use-cases/pause-game-use-case';
import { RestartGameStageUseCase } from '../../../../../application/game-session/live/host/use-cases/restart-game-stage-use-case';
import { ResumeGameUseCase } from '../../../../../application/game-session/live/host/use-cases/resume-game-use-case';
import { ReturnGameToLobbyUseCase } from '../../../../../application/game-session/live/host/use-cases/return-game-to-lobby-use-case';
import { RewindGameStageUseCase } from '../../../../../application/game-session/live/host/use-cases/rewind-game-stage-use-case';
import { StartGameUseCase } from '../../../../../application/game-session/live/host/use-cases/start-game-use-case';
import { GAME_SOCKET_OUTBOUND_EVENT } from '../../shared/realtime/game-socket-events';
import { HostGameGateway } from './host-game-gateway';

function createGateway() {
  const logger = {
    error: vi.fn(),
  } as unknown as Logger;
  const startGameUseCase = { execute: vi.fn() } as unknown as StartGameUseCase;
  const advanceGameStageUseCase = { execute: vi.fn() } as unknown as AdvanceGameStageUseCase;
  const restartGameStageUseCase = { execute: vi.fn() } as unknown as RestartGameStageUseCase;
  const rewindGameStageUseCase = { execute: vi.fn() } as unknown as RewindGameStageUseCase;
  const returnGameToLobbyUseCase = { execute: vi.fn() } as unknown as ReturnGameToLobbyUseCase;
  const pauseGameUseCase = { execute: vi.fn() } as unknown as PauseGameUseCase;
  const resumeGameUseCase = { execute: vi.fn() } as unknown as ResumeGameUseCase;
  const endGameUseCase = { execute: vi.fn() } as unknown as EndGameUseCase;

  return {
    gateway: new HostGameGateway(
      logger,
      startGameUseCase,
      advanceGameStageUseCase,
      restartGameStageUseCase,
      rewindGameStageUseCase,
      returnGameToLobbyUseCase,
      pauseGameUseCase,
      resumeGameUseCase,
      endGameUseCase,
    ),
    startGameUseCase,
    advanceGameStageUseCase,
    pauseGameUseCase,
  };
}

function createClient(user?: { id: number; username: string }) {
  return {
    data: user ? { user } : {},
    emit: vi.fn(),
  };
}

describe('HostGameGateway', () => {
  it('rejects unauthenticated host controls', async () => {
    const { gateway, pauseGameUseCase } = createGateway();
    const client = createClient();

    await gateway.handleStopGame(client as never, { pin: 'AB12CD', hostId: 999 });

    expect(pauseGameUseCase.execute).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith(GAME_SOCKET_OUTBOUND_EVENT.ERROR, {
      message: 'UNAUTHORIZED_SESSION_CONTROL',
    });
  });

  it('uses the authenticated socket user for host controls instead of the client payload', async () => {
    const { gateway, pauseGameUseCase } = createGateway();
    const client = createClient({ id: 7, username: 'host' });

    await gateway.handleStopGame(client as never, { pin: 'AB12CD', hostId: 999 });

    expect(pauseGameUseCase.execute).toHaveBeenCalledWith('AB12CD', 7);
  });

  it('passes the authenticated socket user to start game use case', async () => {
    const { gateway, startGameUseCase } = createGateway();
    const client = createClient({ id: 7, username: 'host' });

    await gateway.handleStartGame(client as never, { pin: 'AB12CD' });

    expect(startGameUseCase.execute).toHaveBeenCalledWith('AB12CD', 7);
  });

  it('passes the authenticated socket user to next stage use case', async () => {
    const { gateway, advanceGameStageUseCase } = createGateway();
    const client = createClient({ id: 7, username: 'host' });

    await gateway.handleNextStage(client as never, { pin: 'AB12CD' });

    expect(advanceGameStageUseCase.execute).toHaveBeenCalledWith('AB12CD', 7);
  });
});
