import { Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { JoinGameUseCase } from '../../../../../application/game-session/live/player/use-cases/join-game-use-case';
import { RemoveDisconnectedPlayerUseCase } from '../../../../../application/game-session/live/player/use-cases/remove-disconnected-player-use-case';
import { SubmitActionUseCase } from '../../../../../application/game-session/live/player/use-cases/submit-action-use-case';
import { GAME_SOCKET_OUTBOUND_EVENT } from '../../shared/realtime/game-socket-events';
import { AvatarUriService } from '../../shared/realtime/services/avatar-uri-service';
import { PlayerGameGateway } from './player-game-gateway';

function createGateway() {
  const logger = {
    debug: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger;
  const removeDisconnectedPlayerUseCase = {
    execute: vi.fn(),
  } as unknown as RemoveDisconnectedPlayerUseCase;
  const joinGameUseCase = { execute: vi.fn() } as unknown as JoinGameUseCase;
  const submitActionUseCase = { execute: vi.fn() } as unknown as SubmitActionUseCase;
  const avatarUriService = {
    buildUserAvatarUri: vi.fn((userId: number) => `/avatars/users/${userId}`),
    buildGuestPlayerAvatarUri: vi.fn((guestId: string) => `/avatars/guests/${guestId}`),
  } as unknown as AvatarUriService;

  return {
    gateway: new PlayerGameGateway(
      logger,
      removeDisconnectedPlayerUseCase,
      joinGameUseCase,
      submitActionUseCase,
      avatarUriService,
    ),
    joinGameUseCase,
  };
}

function createClient(user?: { id: number; username: string }) {
  return {
    id: 'socket-1',
    data: user ? { user } : {},
    join: vi.fn(),
    leave: vi.fn(),
    emit: vi.fn(),
  };
}

describe('PlayerGameGateway', () => {
  it('uses the authenticated socket user for player joins instead of the client payload', async () => {
    const { gateway, joinGameUseCase } = createGateway();
    const client = createClient({ id: 7, username: 'neo' });

    await gateway.handleJoinGame(client as never, {
      pin: 'AB12CD',
      username: 'Neo',
      userId: 999,
    });

    expect(joinGameUseCase.execute).toHaveBeenCalledWith('socket-1', {
      pin: 'AB12CD',
      username: 'Neo',
      userId: 7,
    });
  });

  it('rejects authenticated player joins when the socket has no authenticated user', async () => {
    const { gateway, joinGameUseCase } = createGateway();
    const client = createClient();

    const result = await gateway.handleJoinGame(client as never, {
      pin: 'AB12CD',
      username: 'Neo',
      userId: 999,
    });

    expect(joinGameUseCase.execute).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith(GAME_SOCKET_OUTBOUND_EVENT.ERROR, {
      message: 'UNAUTHORIZED_SESSION_CONTROL',
    });
    expect(result).toEqual({
      status: 'rejected',
      errorCode: 'UNAUTHORIZED_SESSION_CONTROL',
    });
  });
});
