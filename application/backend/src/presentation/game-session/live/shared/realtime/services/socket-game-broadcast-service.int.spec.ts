import type { Server } from 'socket.io';
import { describe, expect, it, vi } from 'vitest';
import { PlayerState } from '../../../../../../domain/game/entities/player-state';
import { GameType } from '../../../../../../domain/game/enums/game-type.enum';
import {
  type GameBroadcastEvent,
  GameBroadcastEventType,
} from '../../../../../../domain/game/ports/services/game-broadcast.service';
import { AvatarUriService } from './avatar-uri-service';
import { SOCKET_OUTBOUND_EVENT_BY_TYPE } from './socket-game-broadcast-events';
import { SocketGameBroadcastMessageMapper } from './socket-game-broadcast-message-mapper';
import { SocketGameBroadcastService } from './socket-game-broadcast-service';

describe('SocketGameBroadcastService', () => {
  let service: SocketGameBroadcastService;
  let avatarUriService: AvatarUriService;

  it('publishes player joined events with avatar urls', () => {
    avatarUriService = new AvatarUriService();
    service = new SocketGameBroadcastService(
      new SocketGameBroadcastMessageMapper(avatarUriService),
    );

    const emit = vi.fn();
    const to = vi.fn(() => ({ emit }));
    const server = { to } as unknown as Server;
    service.setServer(server);

    const event: GameBroadcastEvent = {
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: '123456',
      sessionId: 1,
      gameTitle: 'Arcade Trivia',
      gameType: GameType.QUIZ,
      players: [PlayerState.createAuthenticated('socket-1', 1, 'Alice', 'seed-1')],
    };

    service.publish(event);

    expect(to).toHaveBeenCalledWith('123456');
    expect(emit).toHaveBeenCalledWith(SOCKET_OUTBOUND_EVENT_BY_TYPE['player-joined'], {
      gameTitle: 'Arcade Trivia',
      gameType: 'quiz',
      players: [
        {
          id: 1,
          guestId: undefined,
          username: 'Alice',
          avatarUri: avatarUriService.buildUserAvatarUri(1),
        },
      ],
    });
  });

  it('publishes leaderboard events with backend avatar urls', () => {
    avatarUriService = new AvatarUriService();
    service = new SocketGameBroadcastService(
      new SocketGameBroadcastMessageMapper(avatarUriService),
    );

    const emit = vi.fn();
    const to = vi.fn(() => ({ emit }));
    const server = { to } as unknown as Server;
    service.setServer(server);

    const event: GameBroadcastEvent = {
      type: GameBroadcastEventType.LEADERBOARD_UPDATED,
      pin: '123456',
      leaderboard: [
        {
          userId: 1,
          username: 'Alice',
          totalPoints: 100,
          rank: 1,
        },
        {
          guestId: 'guest-1',
          username: 'Switch',
          totalPoints: 80,
          rank: 2,
        },
      ],
    };

    service.publish(event);

    expect(emit).toHaveBeenCalledWith(SOCKET_OUTBOUND_EVENT_BY_TYPE['leaderboard-updated'], {
      leaderboard: [
        {
          userId: 1,
          guestId: undefined,
          username: 'Alice',
          totalPoints: 100,
          rank: 1,
          avatarUri: avatarUriService.buildUserAvatarUri(1),
        },
        {
          userId: undefined,
          guestId: 'guest-1',
          username: 'Switch',
          totalPoints: 80,
          rank: 2,
          avatarUri: avatarUriService.buildGuestPlayerAvatarUri('guest-1'),
        },
      ],
    });
  });
});
