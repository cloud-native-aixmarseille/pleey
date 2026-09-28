import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import {
  type PartyRuntimeContext,
  PartyRuntimePhase,
} from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import { MediaErrorCode } from '../../../../../domain/media/enums/media-error-code.enum';
import { createPartyMediaAccessFixture } from '../../../../../test-utils/fixtures/unit/party-media-access.fixture';

describe('PartyObservationMediaAccessService', () => {
  it('grants the current result media to the host audience after the party ends', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    const context: PartyRuntimeContext = {
      lifecycle: { ...fixture.context.lifecycle, phase: PartyRuntimePhase.RESULT },
      result: { currentPlayer: null, current: { text: 'Private result', actions: [], media: fixture.stageMedia } },
    };
    const snapshot = {
      ...fixture.snapshot,
      hostObservation: { ...fixture.snapshot.hostObservation, context, status: PartyStatus.ENDED },
      playerObservation: { ...fixture.snapshot.playerObservation, context, status: PartyStatus.ENDED },
    };
    fixture.client.data = fixture.hostSocketData;
    fixture.runtime.findPartyByPin.mockResolvedValue({ ...fixture.target, status: PartyStatus.ENDED });

    // Act
    const grant = await fixture.mediaAccess.request(fixture.client, snapshot, fixture.stageMedia.id);
    const message = await fixture.broadcaster.emitSnapshot(fixture.client, snapshot);

    // Assert
    expect(grant).toEqual({ ...fixture.grant, partyId: fixture.partyId });
    expect(message.context?.result?.current?.media).toEqual(grant);
  });

  it('withholds media from a joined player audience', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();

    // Act
    const message = await fixture.broadcaster.emitSnapshot(fixture.client, fixture.snapshot);

    // Assert: players never receive a signed grant, in the snapshot or on request
    expect(message.context?.stage?.current).toMatchObject({ media: null, text: 'Private question' });
    await expect(fixture.mediaAccess.request(fixture.client, fixture.snapshot, fixture.stageMedia.id)).rejects.toThrow(
      GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE,
    );
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });

  it('keeps host delivery available when a stored question references retired media', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.client.data = fixture.hostSocketData;
    fixture.issuer.issue.mockRejectedValue(new Error(MediaErrorCode.MEDIA_UNAVAILABLE));

    // Act
    const message = await fixture.broadcaster.emitSnapshot(fixture.client, fixture.snapshot);

    // Assert
    expect(message.context?.stage?.current).toMatchObject({ media: null, text: 'Private question' });
  });

  it('propagates unexpected media delivery errors', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.client.data = fixture.hostSocketData;
    fixture.issuer.issue.mockRejectedValue(new Error('unexpected'));

    // Act + Assert
    await expect(fixture.broadcaster.emitSnapshot(fixture.client, fixture.snapshot)).rejects.toThrow('unexpected');
  });

  it('refreshes only the current question asset for the host', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.client.data = fixture.hostSocketData;

    // Act
    const grant = await fixture.mediaAccess.request(fixture.client, fixture.snapshot, fixture.stageMedia.id);

    // Assert
    expect(grant).toEqual({ ...fixture.grant, partyId: fixture.partyId });
  });

  it('denies media refresh after the host account session is revoked', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.client.data = fixture.hostSocketData;
    fixture.sessions.validate.mockRejectedValue(new Error('revoked'));

    // Act + Assert
    await expect(fixture.mediaAccess.request(fixture.client, fixture.snapshot, fixture.stageMedia.id)).rejects.toThrow(
      GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE,
    );
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });

  it.each(['observer', 'player', 'host-unrelated-asset'])(
    'denies refresh for %s before invoking the signer',
    async (scenario) => {
      // Arrange
      const fixture = createPartyMediaAccessFixture();
      if (scenario === 'observer') fixture.client.data = {};
      if (scenario === 'host-unrelated-asset') fixture.client.data = fixture.hostSocketData;
      const assetId = scenario === 'host-unrelated-asset' ? 'other-asset' : fixture.stageMedia.id;

      // Act + Assert
      await expect(fixture.mediaAccess.request(fixture.client, fixture.snapshot, assetId)).rejects.toThrow(
        GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE,
      );
      expect(fixture.issuer.issue).not.toHaveBeenCalled();
    },
  );
});
