import { describe, expect, it } from 'vitest';
import { HostPartyDisabledReason } from '../../../../../domains/game/party/host/value-objects/host-party-permissions';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';
import { PartyFixtureFactory } from '../../../../../test-utils/fixtures/party-fixture-factory';
import { HostPartyRuntimeControlsResolver } from './host-party-runtime-controls-resolver';

const fixtures = new PartyFixtureFactory();

describe('HostPartyRuntimeControlsResolver', () => {
  it('preserves authoritative decisions even when local status would suggest a grant', () => {
    // Arrange
    const party = fixtures.createPartyObservation({
      isObserverHost: true,
      status: PartyStatus.WAITING,
      permissions: fixtures.createHostPermissions({
        startParty: { allowed: false, reason: HostPartyDisabledReason.NO_STAGES },
      }),
    });
    // Act
    const result = new HostPartyRuntimeControlsResolver().resolveControls(party);
    // Assert
    expect(result.permissions).toBe(party.permissions);
    expect(result.permissions.startParty).toEqual({ allowed: false, reason: HostPartyDisabledReason.NO_STAGES });
    expect(result.currentStageNumber).toBeNull();
    expect(result.hasNextStage).toBe(false);
  });
});
