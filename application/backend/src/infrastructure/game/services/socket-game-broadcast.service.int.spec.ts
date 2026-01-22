import { Test, type TestingModule } from '@nestjs/testing';
import type { Server } from 'socket.io';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GameBroadcastEventType } from '../../../application/game/ports/game-broadcast.service';
import { buildSessionPlayerAvatarUri } from '../../../application/shared/utils/avatar-uri.util';
import type { GameSessionId } from '../../../domain/game/entities/game-session';
import type { QuestionId } from '../../../domain/quiz/entities/question';
import { createPlayerStateFixture, createQuestionFixture } from '../../../test-utils/fixtures/unit';
import { SocketGameBroadcastService } from './socket-game-broadcast.service';
import { SOCKET_OUTBOUND_EVENT_BY_TYPE } from './socket-game-broadcast-events';

describe('SocketGameBroadcastService (integration)', () => {
  let module: TestingModule;
  let service: SocketGameBroadcastService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [SocketGameBroadcastService],
    }).compile();
    service = module.get(SocketGameBroadcastService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('emits correct event names and payload mappings', () => {
    const emitted: Array<{ target: string; event: string; payload: unknown }> = [];

    const server = {
      to: (target: string) => ({
        emit: (event: string, payload: unknown) => {
          emitted.push({ target, event, payload });
        },
      }),
    } as unknown as Server;

    service.setServer(server);

    const pin = '1234';
    const sessionId = 99 as GameSessionId;

    const player = createPlayerStateFixture({
      socketId: 'socket-1',
      guestId: 'guest-1',
      username: 'alice',
      avatarSeed: 'seed-1',
    });
    const question = createQuestionFixture({
      id: 1 as QuestionId,
      questionText: 'Q1',
    });

    service.publish({
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin,
      sessionId,
      players: [player],
    });
    service.publish({
      type: GameBroadcastEventType.GAME_STARTED,
      pin,
      question,
      totalQuestions: 10,
    });
    service.publish({
      type: GameBroadcastEventType.ANSWER_ACKNOWLEDGED,
      connectionId: 'socket-1',
    });

    expect(emitted.length).toBe(3);

    expect(emitted[0]).toEqual({
      target: pin,
      event: SOCKET_OUTBOUND_EVENT_BY_TYPE[GameBroadcastEventType.PLAYER_JOINED],
      payload: {
        players: [
          {
            id: undefined,
            guestId: 'guest-1',
            username: 'alice',
            avatar: buildSessionPlayerAvatarUri(sessionId, 'seed-1'),
          },
        ],
      },
    });

    expect(emitted[1]?.event).toBe(
      SOCKET_OUTBOUND_EVENT_BY_TYPE[GameBroadcastEventType.GAME_STARTED],
    );
    const startedPayload = emitted[1]?.payload as { question: { id: QuestionId } };
    expect(startedPayload.question.id).toBe(1);

    expect(emitted[2]).toEqual({
      target: 'socket-1',
      event: SOCKET_OUTBOUND_EVENT_BY_TYPE[GameBroadcastEventType.ANSWER_ACKNOWLEDGED],
      payload: { acknowledged: true },
    });
  });
});
