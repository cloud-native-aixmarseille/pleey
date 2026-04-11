import { inject, injectable } from 'inversify';
import {
  type AuthSessionTransport,
  type AuthSessionTransportHandlers,
} from '../../application/identity/contracts/auth-runtime.port';
import { SocketIoPartyRealtimeTransport } from '../../infrastructure/game/party/shared/socket-io-party-realtime-transport';
import { GraphqlClient } from '../../infrastructure/graphql/client/graphql-client';

@injectable()
export class AppAuthSessionTransportHub implements AuthSessionTransport {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(SocketIoPartyRealtimeTransport)
    private readonly partyRealtimeTransport: SocketIoPartyRealtimeTransport,
  ) {}

  setAuthSessionTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void {
    this.graphqlClient.setAuthSessionTokens(tokens);
    this.partyRealtimeTransport.setAuthSessionTokens(tokens);
  }

  registerAuthSessionHandlers(handlers: AuthSessionTransportHandlers): void {
    this.graphqlClient.registerAuthSessionHandlers(handlers);
  }
}
