import { describe, expect, it, vi } from 'vitest';
import { PartyIdentifier } from '../../application/game/party/shared/services/identifiers/party-identifier';
import { createMediaAccessFixture } from '../../test-utils/fixtures/media-access.fixture';
import { GraphqlClientMockFactory } from '../../test-utils/mocks/graphql-client-mock-factory';
import { PartyIdentifierMockFactory } from '../../test-utils/mocks/party-identifier-mock-factory';
import { SocketIoPartyRealtimeTransport } from '../game/party/shared/socket-io-party-realtime-transport';
import { QuizQuestionMediaAccessDocument } from '../graphql/generated/graphql';
import { AuthorizedMediaAccessAdapter } from './authorized-media-access.adapter';

describe('AuthorizedMediaAccessAdapter', () => {
  it('renews editor media through the authenticated GraphQL operation', async () => {
    // Arrange
    const fixture = createMediaAccessFixture();
    const graphql = new GraphqlClientMockFactory().create({
      requestResult: { quizQuestionMediaAccess: fixture.renewed },
    });
    const partyIdentifier = new PartyIdentifier();
    const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);
    const partyRequest = vi.spyOn(transport, 'requestMediaAccess');
    const adapter = new AuthorizedMediaAccessAdapter(graphql.client, transport, partyIdentifier);

    // Act
    const grant = await adapter.renew({ id: fixture.initial.id });

    // Assert
    expect(grant).toEqual(fixture.renewed);
    expect(graphql.requestMock).toHaveBeenCalledWith(
      QuizQuestionMediaAccessDocument,
      { assetId: fixture.initial.id },
      undefined,
    );
    expect(partyRequest).not.toHaveBeenCalled();
  });

  it('renews party media through its existing realtime transport', async () => {
    // Arrange
    const fixture = createMediaAccessFixture();
    const graphql = new GraphqlClientMockFactory().create();
    const partyIdentifier = new PartyIdentifierMockFactory().create();
    const partyId = partyIdentifier.parse(44);
    const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);
    const grant = { ...fixture.renewed, partyId };
    const partyRequest = vi.spyOn(transport, 'requestMediaAccess').mockResolvedValue(grant);
    const adapter = new AuthorizedMediaAccessAdapter(graphql.client, transport, partyIdentifier);

    // Act
    const result = await adapter.renew({ id: fixture.initial.id, partyId });

    // Assert
    expect(result).toEqual(grant);
    expect(partyRequest).toHaveBeenCalledWith(partyId, fixture.initial.id);
    expect(graphql.requestMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid party identifier before requesting either delivery path', async () => {
    // Arrange
    const graphql = new GraphqlClientMockFactory().create();
    const partyIdentifier = new PartyIdentifier();
    const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);
    const partyRequest = vi.spyOn(transport, 'requestMediaAccess');
    const adapter = new AuthorizedMediaAccessAdapter(graphql.client, transport, partyIdentifier);

    // Act + Assert
    await expect(adapter.renew({ id: 'asset-1', partyId: 'invalid-party' })).rejects.toThrow();
    expect(partyRequest).not.toHaveBeenCalled();
    expect(graphql.requestMock).not.toHaveBeenCalled();
  });

  it('propagates a rejected party grant without falling back to editor access', async () => {
    // Arrange
    const graphql = new GraphqlClientMockFactory().create();
    const partyIdentifier = new PartyIdentifierMockFactory().create();
    const partyId = partyIdentifier.parse(44);
    const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);
    vi.spyOn(transport, 'requestMediaAccess').mockRejectedValue(new Error('denied'));
    const adapter = new AuthorizedMediaAccessAdapter(graphql.client, transport, partyIdentifier);

    // Act + Assert
    await expect(adapter.renew({ id: 'asset-1', partyId })).rejects.toThrow('denied');
    expect(graphql.requestMock).not.toHaveBeenCalled();
  });
});
