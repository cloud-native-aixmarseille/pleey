import { inject, injectable } from 'inversify';
import { PartyIdentifier } from '../../application/game/party/shared/services/identifiers/party-identifier';
import type {
  MediaAccessGrant,
  MediaAccessPort,
  MediaAccessRequest,
} from '../../domains/media/ports/media-access.port';
import { SocketIoPartyRealtimeTransport } from '../game/party/shared/socket-io-party-realtime-transport';
import { GraphqlClient } from '../graphql/client/graphql-client';
import { QuizQuestionMediaAccessDocument } from '../graphql/generated/graphql';

@injectable()
export class AuthorizedMediaAccessAdapter implements MediaAccessPort {
  constructor(
    @inject(GraphqlClient) private readonly graphql: GraphqlClient,
    @inject(SocketIoPartyRealtimeTransport) private readonly parties: SocketIoPartyRealtimeTransport,
    @inject(PartyIdentifier) private readonly partyIdentifier: PartyIdentifier,
  ) {}

  async renew(request: MediaAccessRequest): Promise<MediaAccessGrant> {
    if (request.partyId !== undefined) {
      return this.parties.requestMediaAccess(this.partyIdentifier.parse(request.partyId), request.id);
    }
    const response = await this.graphql.request(QuizQuestionMediaAccessDocument, { assetId: request.id });
    return response.quizQuestionMediaAccess;
  }
}
