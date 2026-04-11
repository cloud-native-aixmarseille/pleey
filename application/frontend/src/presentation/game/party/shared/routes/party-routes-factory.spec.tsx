import { describe, expect, it } from 'vitest';
import { PartyRoutesFactory } from './party-routes-factory';

const partyRouteService = {
  normalizePartyId: () => null,
  normalizePin: () => null,
  resolveJoinPartyAbsoluteUrl: (pin: string) => `https://pleey.localhost/join/${pin}`,
  resolveJoinPartyRoutePattern: () => 'join/:pin',
  resolvePartyLeaderboardRoutePattern: () => 'party/:partyId/final',
  resolvePartyLobbyRoutePattern: () => 'party/:partyId/lobby',
  resolvePartyResultRoutePattern: () => 'party/:partyId/stage/:stageId/result',
  resolvePartyStageRoutePattern: () => 'party/:partyId/stage/:stageId',
};

describe('PartyRoutesFactory', () => {
  it('registers the host lobby, leaderboard, stage, result, and join routes', () => {
    const routes = new PartyRoutesFactory(partyRouteService as never).create();

    expect(routes).toHaveLength(5);
    expect(routes[0].path).toBe('party/:partyId/lobby');
    expect(routes[1].path).toBe('party/:partyId/final');
    expect(routes[2].path).toBe('party/:partyId/stage/:stageId');
    expect(routes[3].path).toBe('party/:partyId/stage/:stageId/result');
    expect(routes[4].path).toBe('join/:pin');
  });
});
