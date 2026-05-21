import { describe, expect, it } from 'vitest';
import { PartyRole } from '../../../../../domains/game/party/shared/entities/party-role';
import { PartyIdentifier } from './identifiers/party-identifier';
import { PartyPinIdentifier } from './identifiers/party-pin-identifier';
import { StageIdentifier } from './identifiers/stage-identifier';
import { PartyRouteService } from './party-route.service';

const partyIdentifier = new PartyIdentifier();
const partyPinIdentifier = new PartyPinIdentifier();
const stageIdentifier = new StageIdentifier();

describe('PartyRouteService', () => {
  const service = new PartyRouteService(partyIdentifier, partyPinIdentifier, stageIdentifier);

  it('builds the host lobby route under /party/:partyId/lobby', () => {
    expect(
      service.resolvePartyRoute({
        partyId: partyIdentifier.parse(44),
        role: PartyRole.HOST,
        pin: partyPinIdentifier.parse('AB12CD'),
      }),
    ).toBe('/party/44/lobby');
  });

  it('builds the join route under /join/:pin for players', () => {
    expect(
      service.resolvePartyRoute({
        partyId: partyIdentifier.parse(44),
        role: PartyRole.PLAYER,
        pin: partyPinIdentifier.parse(' ab12cd '),
      }),
    ).toBe('/join/AB12CD');
  });

  it('exposes the frontend host lobby and join route patterns for route factories', () => {
    expect(service.resolvePartyJourneyRoutePattern()).toBe('party/:partyId/*');
    expect(service.resolvePartyLobbyRoutePattern()).toBe('party/:partyId/lobby');
    expect(service.resolvePartyLeaderboardRoutePattern()).toBe('party/:partyId/final');
    expect(service.resolvePartyStageRoutePattern()).toBe('party/:partyId/stage/:stageId');
    expect(service.resolvePartyResultRoutePattern()).toBe('party/:partyId/stage/:stageId/result');
    expect(service.resolveJoinPartyRoutePattern()).toBe('join/:pin');
  });

  it('builds dedicated host runtime routes for leaderboard, stage, and result screens', () => {
    expect(service.resolvePartyLeaderboardRoute(partyIdentifier.parse(44))).toBe('/party/44/final');
    expect(
      service.resolvePartyStageRoute(partyIdentifier.parse(44), stageIdentifier.parse(2)),
    ).toBe('/party/44/stage/2');
    expect(
      service.resolvePartyResultRoute(partyIdentifier.parse(44), stageIdentifier.parse(2)),
    ).toBe('/party/44/stage/2/result');
  });

  it('builds an absolute canonical join url for sharing', () => {
    expect(
      service.resolveJoinPartyAbsoluteUrl(
        partyPinIdentifier.parse(' ab12cd '),
        'https://pleey.app/app/',
      ),
    ).toBe('https://pleey.app/join/AB12CD');
  });

  it('normalizes blank pins to null', () => {
    expect(service.normalizePin('   ')).toBeNull();
  });

  it('normalizes blank or invalid party ids to null', () => {
    expect(service.normalizePartyId('   ')).toBeNull();
    expect(service.normalizePartyId('0')).toBeNull();
    expect(service.normalizePartyId(' 44 ')).toBe(partyIdentifier.parse(44));
  });

  it('normalizes blank or invalid stage ids to null', () => {
    expect(service.normalizeStageId('   ')).toBeNull();
    expect(service.normalizeStageId('0')).toBeNull();
    expect(service.normalizeStageId(' 4 ')).toBe(stageIdentifier.parse(4));
  });
});
