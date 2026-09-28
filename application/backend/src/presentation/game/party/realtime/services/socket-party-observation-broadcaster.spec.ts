import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { createPartyMediaAccessFixture } from '../../../../../test-utils/fixtures/unit/party-media-access.fixture';

describe('SocketPartyObservationBroadcaster', () => {
  it('withholds the signed grant from a joined player without changing the shared snapshot', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();

    // Act
    const message = await fixture.broadcaster.emitSnapshot(fixture.client, fixture.snapshot);

    // Assert
    expect(message.context?.stage?.current?.media).toBeNull();
    expect(fixture.snapshot.playerObservation.context?.stage?.current?.media).toEqual(fixture.stageMedia);
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });

  it.each(['observer', 'different-party', 'replaced-session', 'removed-member', 'unauthenticated-user'])(
    'withholds question content, players and signing from a %s',
    async (scenario) => {
      // Arrange
      const fixture = createPartyMediaAccessFixture();
      if (scenario === 'observer') fixture.client.data = {};
      if (scenario === 'different-party') {
        fixture.client.data.joinedPartyPlayer = {
          identity: fixture.identity,
          partyId: backendTestIdentifiers.party(999),
          pin: fixture.snapshot.hostObservation.pin,
        };
      }
      if (scenario === 'replaced-session')
        fixture.registry.registerSession(fixture.partyId, fixture.identity, 'new-socket');
      if (scenario === 'removed-member') fixture.runtime.findPartyPlayer.mockResolvedValue(null);
      if (scenario === 'unauthenticated-user') {
        const identity = { kind: PartyPlayerKind.USER, userId: backendTestIdentifiers.user(42) } as const;
        fixture.registry.registerSession(fixture.partyId, identity, fixture.client.id);
        fixture.client.data.joinedPartyPlayer = {
          identity,
          partyId: fixture.partyId,
          pin: fixture.snapshot.hostObservation.pin,
        };
      }

      // Act
      const message = await fixture.broadcaster.emitSnapshot(fixture.client, fixture.snapshot);

      // Assert
      expect(message).toMatchObject({ context: null, isObserverHost: false, players: [] });
      expect(fixture.issuer.issue).not.toHaveBeenCalled();
    },
  );

  it('delivers media to the authenticated owner without requiring player membership', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.client.data = fixture.hostSocketData;

    // Act
    const message = await fixture.broadcaster.emitSnapshot(fixture.client, fixture.snapshot);

    // Assert
    expect(message.isObserverHost).toBe(true);
    expect(message).toMatchObject({ permissions: fixture.snapshot.hostPermissions });
    expect(message.context?.stage?.current?.media).toEqual({ ...fixture.grant, partyId: fixture.partyId });
  });

  it('continues delivering media to the host after the persisted party has ended', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.client.data = fixture.hostSocketData;
    fixture.runtime.findPartyByPin.mockResolvedValue({ ...fixture.target, status: PartyStatus.ENDED });

    // Act
    const message = await fixture.broadcaster.emitSnapshot(fixture.client, fixture.snapshot);

    // Assert
    expect(message.context?.stage?.current?.media).toEqual({ ...fixture.grant, partyId: fixture.partyId });
  });

  it('removes legacy media without an asset id from host delivery', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.client.data = fixture.hostSocketData;
    const context = fixture.context;
    const snapshot = {
      ...fixture.snapshot,
      hostObservation: {
        ...fixture.snapshot.hostObservation,
        context: {
          ...context,
          stage: {
            ...context.stage,
            current: { ...context.stage.current, media: { mimeType: 'video/mp4', uri: fixture.stageMedia.uri } },
          },
        },
      },
    };

    // Act
    const message = await fixture.broadcaster.emitSnapshot(fixture.client, snapshot);

    // Assert
    expect(message.context?.stage?.current?.media).toBeNull();
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });

  it('publishes updates and runtime notices to host sockets before player sockets', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    const deliveryOrder: string[] = [];
    const hostSocket = {
      id: 'host',
      data: fixture.hostSocketData,
      emit: vi.fn(() => deliveryOrder.push('host')),
    };
    fixture.client.emit.mockImplementation(() => deliveryOrder.push('player'));
    const observerSocket = {
      id: 'observer',
      data: {},
      emit: vi.fn((_event: string, _payload: unknown) => deliveryOrder.push('observer')),
    };
    fixture.broadcaster.attachServer({
      in: vi
        .fn()
        .mockReturnValue({ fetchSockets: vi.fn().mockResolvedValue([observerSocket, fixture.client, hostSocket]) }),
    } as never);

    // Act
    await fixture.broadcaster.publish(fixture.snapshot);
    await fixture.broadcaster.publishRuntimeNotice(
      fixture.partyId,
      fixture.snapshot.hostObservation.host.userId,
      'rewindStage',
    );

    // Assert
    expect(deliveryOrder).toEqual(['host', 'player', 'observer', 'host', 'player', 'observer']);
    expect(observerSocket.emit.mock.calls[0]?.[1]).toMatchObject({ context: null, players: [] });
  });

  it('rechecks revoked account sessions before sending an update', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.client.data = fixture.hostSocketData;
    fixture.sessions.validate.mockRejectedValue(new Error('revoked'));
    fixture.broadcaster.attachServer({
      in: vi.fn().mockReturnValue({ fetchSockets: vi.fn().mockResolvedValue([fixture.client]) }),
    } as never);

    // Act
    await fixture.broadcaster.publish(fixture.snapshot);

    // Assert
    expect(fixture.client.emit).not.toHaveBeenCalled();
    expect(fixture.client.leave).toHaveBeenCalledWith(`party:${fixture.partyId}`);
    expect(fixture.sessions.validate).toHaveBeenCalledWith(fixture.hostSocketData.authenticatedSession, false);
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });

  it('denies a private snapshot to an anonymous observer before emitting it', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.client.data = {};
    const snapshot = {
      ...fixture.snapshot,
      hostObservation: { ...fixture.snapshot.hostObservation, isPrivate: true },
    };

    // Act + Assert
    await expect(fixture.broadcaster.emitSnapshot(fixture.client, snapshot)).rejects.toThrow('PARTY_NOT_FOUND');
    expect(fixture.client.emit).not.toHaveBeenCalled();
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });
});
