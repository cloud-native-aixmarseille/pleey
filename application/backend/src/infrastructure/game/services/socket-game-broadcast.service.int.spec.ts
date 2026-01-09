import type { Server } from 'socket.io';
import { describe, expect, it } from 'vitest';
import { buildSessionPlayerAvatarUrl } from '../../../application/shared/utils/avatar-url.util';
import { PlayerState } from '../../../domain/game/entities/player-state';
import { Question } from '../../../domain/quiz/entities/question';
import { SocketGameBroadcastService } from './socket-game-broadcast.service';
import { SOCKET_OUTBOUND_EVENT_BY_TYPE } from './socket-game-broadcast-events';

describe('SocketGameBroadcastService (integration)', () => {
  it('emits correct event names and payload mappings', () => {
    const emitted: Array<{ target: string; event: string; payload: unknown }> = [];

    const server: Partial<Server> = {
      to: (target: string) => ({
        emit: (event: string, payload: unknown) => {
          emitted.push({ target, event, payload });
        },
      }),
    };

    const service = new SocketGameBroadcastService();
    service.setServer(server as Server);

    const pin = '1234';
    const sessionId = 99;

    const player = PlayerState.createGuest('socket-1', 'guest-1', 'alice', 'seed-1');
    const question = new Question(1, 10, 'Q1', 'multiple', 'A', 'A', 'B', 'C', 'D', 20, 1000);

    service.publish({ type: 'player-joined', pin, sessionId, players: [player] });
    service.publish({ type: 'game-started', pin, question, questionNumber: 1, totalQuestions: 10 });
    service.publish({ type: 'answer-acknowledged', connectionId: 'socket-1' });

    expect(emitted.length).toBe(3);

    expect(emitted[0]).toEqual({
      target: pin,
      event: SOCKET_OUTBOUND_EVENT_BY_TYPE['player-joined'],
      payload: {
        players: [
          {
            id: undefined,
            guestId: 'guest-1',
            username: 'alice',
            avatar: buildSessionPlayerAvatarUrl(sessionId, 'seed-1'),
            isGuest: true,
          },
        ],
      },
    });

    expect(emitted[1]?.event).toBe(SOCKET_OUTBOUND_EVENT_BY_TYPE['game-started']);
    const startedPayload = emitted[1]?.payload as { question: { id: number } };
    expect(startedPayload.question.id).toBe(1);

    expect(emitted[2]).toEqual({
      target: 'socket-1',
      event: SOCKET_OUTBOUND_EVENT_BY_TYPE['answer-acknowledged'],
      payload: { acknowledged: true },
    });
  });
});
