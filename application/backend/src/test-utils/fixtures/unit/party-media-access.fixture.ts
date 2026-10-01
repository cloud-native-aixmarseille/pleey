import { vi } from 'vitest';
import type { PartyObservationSnapshot } from '../../../application/game/party/shared/entities/party-observation-snapshot';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPlayerKind } from '../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../domain/game/party/enums/party-status.enum';
import { PartyPlayerSessionRegistry } from '../../../domain/game/party/player/services/party-player-session-registry';
import { PartyRuntimePhase } from '../../../domain/game/party/shared/entities/party-runtime-context';
import { DEFAULT_PARTY_SETTINGS } from '../../../domain/game/party/shared/entities/party-settings';
import { GameType } from '../../../domain/game/types/shared/entities/game-type';
import type { PartyObserverSocketData } from '../../../presentation/game/party/realtime/party-observer-socket-data';
import { HostPartyObservationMessageMapper } from '../../../presentation/game/party/realtime/services/host-party-observation-message-mapper';
import { PartyObservationAudienceResolver } from '../../../presentation/game/party/realtime/services/party-observation-audience-resolver';
import { PartyObservationMediaAccessService } from '../../../presentation/game/party/realtime/services/party-observation-media-access.service';
import { PlayerPartyObservationMessageMapper } from '../../../presentation/game/party/realtime/services/player-party-observation-message-mapper';
import { SocketPartyObservationBroadcaster } from '../../../presentation/game/party/realtime/services/socket-party-observation-broadcaster';
import { backendTestIdentifiers } from '../../branded-identifiers';
import { createPlayerPartyRuntimeMock } from '../../mock-factories/player-party-runtime.mock-factory';

export function createPartyMediaAccessFixture() {
  const partyId = backendTestIdentifiers.party(44);
  const gameId = backendTestIdentifiers.game(17);
  const pin = backendTestIdentifiers.partyPin('123456');
  const hostUserId = backendTestIdentifiers.user(7);
  const identity = { kind: PartyPlayerKind.GUEST, guestId: backendTestIdentifiers.guest(42) } as const;
  const player = {
    avatarUri: null,
    identity,
    joinedAt: new Date('2026-09-28T10:00:00Z'),
    totalScore: 0,
    username: 'Player',
  };
  const stageMedia = { id: 'asset-1', mimeType: 'video/mp4', uri: 'https://cdn.test/private/key.mp4' };
  const context = {
    lifecycle: {
      phase: PartyRuntimePhase.STAGE,
      stageId: backendTestIdentifiers.partyStage(1),
      stagePosition: 0,
      totalStages: 1,
      stageEndsAtEpochMs: null,
      stageRemainingDurationMs: null,
      stageTimeLimitSeconds: null,
    },
    stage: {
      actionSubmission: null,
      current: { actions: [], media: stageMedia, text: 'Private question' },
    },
  } as const;
  const snapshot: PartyObservationSnapshot = {
    gameType: GameType.Quiz,
    hostObservation: {
      partyId,
      gameId,
      pin,
      status: PartyStatus.ACTIVE,
      settings: DEFAULT_PARTY_SETTINGS,
      context,
      host: { userId: hostUserId, avatarUri: null, username: 'Host' },
      players: [player],
      createdAt: new Date('2026-09-28T10:00:00Z'),
      updatedAt: new Date('2026-09-28T10:00:00Z'),
    },
    playerObservation: {
      partyId,
      pin,
      status: PartyStatus.ACTIVE,
      settings: DEFAULT_PARTY_SETTINGS,
      context,
      host: { avatarUri: null, username: 'Host' },
      playerActionStates: [],
      players: [{ ...player, correctStages: 0 }],
    },
  };
  const registry = new PartyPlayerSessionRegistry();
  registry.registerSession(partyId, identity, 'player-socket');
  const target = {
    partyId,
    gameId,
    pin,
    hostUserId,
    status: PartyStatus.ACTIVE,
    privatePartyPasswordHash: 'hash',
    settings: DEFAULT_PARTY_SETTINGS,
  };
  const runtime = createPlayerPartyRuntimeMock({
    findPartyByPin: target,
    findPartyPlayer: player,
  });
  const grant = {
    id: stageMedia.id,
    mimeType: stageMedia.mimeType,
    uri: 'https://cdn.test/private/key.mp4?signature=valid',
    expiresAt: '2026-09-28T10:05:00.000Z',
  };
  const issuer = { issue: vi.fn().mockResolvedValue(grant) };
  const audienceResolver = new PartyObservationAudienceResolver(registry, runtime);
  const mediaAccess = new PartyObservationMediaAccessService(issuer, audienceResolver);
  const broadcaster = new SocketPartyObservationBroadcaster(
    audienceResolver,
    new HostPartyObservationMessageMapper(),
    new PlayerPartyObservationMessageMapper(),
    new PartyIdentifier(),
    mediaAccess,
  );
  const client = {
    id: 'player-socket',
    data: {
      joinedPartyPlayer: { identity, partyId, pin },
      partyObservationRoom: `party:${partyId}`,
      playerSessionId: 'player-socket',
    } as PartyObserverSocketData,
    emit: vi.fn(),
  };
  return {
    audienceResolver,
    broadcaster,
    client,
    context,
    target,
    grant,
    identity,
    issuer,
    mediaAccess,
    partyId,
    registry,
    runtime,
    snapshot,
    stageMedia,
  };
}
