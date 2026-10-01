import { describe, expect, it, vi } from 'vitest';
import { PartyManagementErrorCode } from '../../../../domains/game/party/shared/errors/party-management-error-code';
import { PartyMediaSocketFixture } from '../../../../test-utils/fixtures/party-media-socket.fixture';
import { PartyIdentifierMockFactory } from '../../../../test-utils/mocks/party-identifier-mock-factory';
import { SocketIoPartyRealtimeTransport } from './socket-io-party-realtime-transport';

const { ioMock } = vi.hoisted(() => ({ ioMock: vi.fn() }));
vi.mock('socket.io-client', () => ({ io: ioMock }));

const partyIdentifier = new PartyIdentifierMockFactory().create();
const PARTY_ID = partyIdentifier.parse(44);
const ASSET_ID = 'asset-1';
const MEDIA = {
  id: ASSET_ID,
  mimeType: 'image/webp',
  uri: 'https://cdn.test/image.webp?signature=valid',
  partyId: PARTY_ID,
};

describe('SocketIoPartyRealtimeTransport media access', () => {
  it('reuses the joined observation connection and accepts its matching fresh grant', async () => {
    // Arrange
    const fixture = new PartyMediaSocketFixture();
    ioMock.mockReset().mockReturnValue(fixture.socket);
    const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);
    transport.observeParty(PARTY_ID, { onSnapshot: vi.fn() });
    const grant = { ...MEDIA, expiresAt: new Date(Date.now() + 60_000).toISOString() };

    // Act
    const request = transport.requestMediaAccess(PARTY_ID, ASSET_ID);
    fixture.acknowledge(grant);

    // Assert
    await expect(request).resolves.toEqual(grant);
    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(fixture.socket.connect).not.toHaveBeenCalled();
    expect(fixture.socket.emit).toHaveBeenLastCalledWith(
      'request-party-media',
      { partyId: PARTY_ID, assetId: ASSET_ID },
      expect.any(Function),
    );
  });

  it.each(['other-party', 'other-asset', 'expired', 'invalid-expiry', 'missing-ack'])(
    'rejects a %s acknowledgement',
    async (scenario) => {
      // Arrange
      const fixture = new PartyMediaSocketFixture();
      ioMock.mockReset().mockReturnValue(fixture.socket);
      const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);
      transport.observeParty(PARTY_ID, { onSnapshot: vi.fn() });
      const grant = {
        ...MEDIA,
        id: scenario === 'other-asset' ? 'asset-2' : ASSET_ID,
        partyId: scenario === 'other-party' ? partyIdentifier.parse(45) : PARTY_ID,
        expiresAt:
          scenario === 'invalid-expiry'
            ? 'invalid-date'
            : new Date(Date.now() + (scenario === 'expired' ? -1000 : 60_000)).toISOString(),
      };

      // Act
      const request = transport.requestMediaAccess(PARTY_ID, ASSET_ID);
      fixture.acknowledge(scenario === 'missing-ack' ? undefined : grant);

      // Assert
      await expect(request).rejects.toThrow(PartyManagementErrorCode.CONNECTION_LOST);
    },
  );

  it.each([
    ['uri', undefined],
    ['uri', 123],
    ['uri', '   '],
    ['mimeType', undefined],
    ['mimeType', 123],
    ['mimeType', '   '],
  ] as const)('rejects malformed %s metadata (%s) in otherwise matching grants', async (field, value) => {
    // Arrange
    const fixture = new PartyMediaSocketFixture();
    ioMock.mockReset().mockReturnValue(fixture.socket);
    const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);
    transport.observeParty(PARTY_ID, { onSnapshot: vi.fn() });
    const grant = { ...MEDIA, expiresAt: new Date(Date.now() + 60_000).toISOString(), [field]: value };

    // Act
    const request = transport.requestMediaAccess(PARTY_ID, ASSET_ID);
    fixture.acknowledge(grant);

    // Assert
    await expect(request).rejects.toThrow(PartyManagementErrorCode.CONNECTION_LOST);
  });

  it('fails immediately without opening a new socket when there is no active party connection', async () => {
    // Arrange
    ioMock.mockReset();
    const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);

    // Act + Assert
    await expect(transport.requestMediaAccess(PARTY_ID, ASSET_ID)).rejects.toThrow(
      PartyManagementErrorCode.CONNECTION_LOST,
    );
    expect(ioMock).not.toHaveBeenCalled();
  });

  it.each(['timeout', 'exception', 'disconnect'])(
    'rejects an interrupted request after %s and ignores its late acknowledgement',
    async (scenario) => {
      // Arrange
      vi.useFakeTimers();
      const fixture = new PartyMediaSocketFixture();
      ioMock.mockReset().mockReturnValue(fixture.socket);
      const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);
      transport.observeParty(PARTY_ID, { onSnapshot: vi.fn() });
      const expectedError =
        scenario === 'exception'
          ? PartyManagementErrorCode.PARTY_COMMAND_NOT_AVAILABLE
          : PartyManagementErrorCode.CONNECTION_LOST;
      const lateGrant = Object.defineProperty({}, 'id', {
        get: () => {
          throw new Error('Late acknowledgement was read');
        },
      });

      // Act + Assert
      try {
        const outcome = transport.requestMediaAccess(PARTY_ID, ASSET_ID).catch((error: unknown) => error);
        if (scenario === 'timeout') await vi.advanceTimersByTimeAsync(10_000);
        if (scenario === 'exception') fixture.dispatch('exception', { message: expectedError });
        if (scenario === 'disconnect') fixture.dispatch('disconnect');

        expect(await outcome).toMatchObject({ code: expectedError });
        expect(() => fixture.acknowledge(lateGrant)).not.toThrow();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it('matches concurrent requests to their own acknowledgements even when replies arrive out of order', async () => {
    // Arrange
    const fixture = new PartyMediaSocketFixture();
    ioMock.mockReset().mockReturnValue(fixture.socket);
    const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);
    transport.observeParty(PARTY_ID, { onSnapshot: vi.fn() });
    const firstGrant = { ...MEDIA, expiresAt: new Date(Date.now() + 60_000).toISOString() };
    const secondGrant = { ...firstGrant, id: 'asset-2' };

    // Act
    const first = transport.requestMediaAccess(PARTY_ID, ASSET_ID);
    const second = transport.requestMediaAccess(PARTY_ID, secondGrant.id);
    fixture.acknowledge(secondGrant, 1);
    fixture.acknowledge(firstGrant, 0);

    // Assert
    await expect(Promise.all([first, second])).resolves.toEqual([firstGrant, secondGrant]);
  });
});
