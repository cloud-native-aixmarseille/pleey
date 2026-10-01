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
  it.each(['player', 'host'])('grants the current result media to its authorized %s audience', async (audience) => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    const context: PartyRuntimeContext = {
      lifecycle: { ...fixture.context.lifecycle, phase: PartyRuntimePhase.RESULT },
      result: { currentPlayer: null, current: { text: 'Private result', actions: [], media: fixture.stageMedia } },
    };
    const status = audience === 'host' ? PartyStatus.ENDED : PartyStatus.ACTIVE;
    const snapshot = {
      ...fixture.snapshot,
      hostObservation: { ...fixture.snapshot.hostObservation, context, status },
      playerObservation: { ...fixture.snapshot.playerObservation, context, status },
    };
    if (audience === 'host') {
      fixture.client.data = { authenticatedUserId: fixture.snapshot.hostObservation.host.userId };
      fixture.runtime.findPartyByPin.mockResolvedValue({ ...fixture.target, status });
    }

    // Act
    const grant = await fixture.mediaAccess.request(fixture.client, snapshot, fixture.stageMedia.id);
    const message = await fixture.broadcaster.emitSnapshot(fixture.client, snapshot);

    // Assert
    expect(grant).toEqual({ ...fixture.grant, partyId: fixture.partyId });
    expect(message.context?.result?.current?.media).toEqual(grant);
  });

  it('keeps party delivery available when a stored result references retired media', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.issuer.issue.mockRejectedValue(new Error(MediaErrorCode.MEDIA_UNAVAILABLE));

    // Act
    const message = await fixture.broadcaster.emitSnapshot(fixture.client, fixture.snapshot);

    // Assert
    expect(message.context?.stage?.current).toMatchObject({ media: null, text: 'Private question' });
  });

  it('propagates unexpected media delivery errors', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();
    fixture.issuer.issue.mockRejectedValue(new Error('unexpected'));

    // Act + Assert
    await expect(fixture.broadcaster.emitSnapshot(fixture.client, fixture.snapshot)).rejects.toThrow('unexpected');
  });

  it('refreshes only the current question asset for an active joined session', async () => {
    // Arrange
    const fixture = createPartyMediaAccessFixture();

    // Act
    const grant = await fixture.mediaAccess.request(fixture.client, fixture.snapshot, fixture.stageMedia.id);

    // Assert
    expect(grant).toEqual({ ...fixture.grant, partyId: fixture.partyId });
  });

  it.each(['observer', 'replaced-session', 'left-session', 'removed-member', 'ended-party', 'unrelated-asset'])(
    'denies refresh for %s before invoking the signer',
    async (scenario) => {
      // Arrange
      const fixture = createPartyMediaAccessFixture();
      if (scenario === 'observer') fixture.client.data = {};
      if (scenario === 'replaced-session')
        fixture.registry.registerSession(fixture.partyId, fixture.identity, 'new-socket');
      if (scenario === 'left-session') fixture.registry.invalidateSession(fixture.partyId, fixture.identity);
      if (scenario === 'removed-member') fixture.runtime.findPartyPlayer.mockResolvedValue(null);
      if (scenario === 'ended-party') {
        fixture.runtime.findPartyByPin.mockResolvedValue({ ...fixture.target, status: PartyStatus.ENDED });
      }
      const assetId = scenario === 'unrelated-asset' ? 'other-asset' : fixture.stageMedia.id;

      // Act + Assert
      await expect(fixture.mediaAccess.request(fixture.client, fixture.snapshot, assetId)).rejects.toThrow(
        GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE,
      );
      expect(fixture.issuer.issue).not.toHaveBeenCalled();
    },
  );
});
