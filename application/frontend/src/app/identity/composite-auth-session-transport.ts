import { inject, injectable } from 'inversify';
import type {
  AuthSessionTransport,
  AuthSessionTransportHandlers,
} from '../../application/identity/contracts/auth-runtime.port';
import { SocketIoGameSessionConnection } from '../../infrastructure/game-session/realtime/socket-io-game-session-connection';
import { GraphqlClient } from '../../infrastructure/graphql/client/graphql-client';

@injectable()
export class CompositeAuthSessionTransport implements AuthSessionTransport {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(SocketIoGameSessionConnection)
    private readonly gameSessionConnection: SocketIoGameSessionConnection,
  ) {}

  setAuthSessionTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void {
    this.graphqlClient.setAuthSessionTokens(tokens);
    this.gameSessionConnection.setAuthSessionTokens(tokens);
  }

  registerAuthSessionHandlers(handlers: AuthSessionTransportHandlers): void {
    this.graphqlClient.registerAuthSessionHandlers(handlers);
  }
}
