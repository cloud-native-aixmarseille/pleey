import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { UnauthorizedError } from '../../domain/identity/errors';
import { JwtSessionAuthenticator } from '../../infrastructure/identity/services/jwt-session-authenticator';
import type { GameSocketCorsOptions } from './game-socket-cors-options.token';

type IoServer = ReturnType<IoAdapter['createIOServer']>;
type IoServerOptions = Parameters<IoAdapter['createIOServer']>[1];
type ResolvedIoServerOptions = NonNullable<IoServerOptions>;
type PartialIoServerOptions = Partial<ResolvedIoServerOptions>;
type IoServerMiddleware = Parameters<IoServer['use']>[0];
type IoSocket = Parameters<IoServerMiddleware>[0];
type IoNext = Parameters<IoServerMiddleware>[1];

export class ConfiguredIoAdapter extends IoAdapter {
  private readonly sessions: JwtSessionAuthenticator;

  constructor(
    app: INestApplicationContext,
    private readonly corsOptions: GameSocketCorsOptions,
    private readonly partySessionRecoveryWindowMs: number,
  ) {
    super(app);
    this.sessions = app.get(JwtSessionAuthenticator);
  }

  override createIOServer(port: number, options?: IoServerOptions): IoServer {
    const serverOptions: PartialIoServerOptions = {
      ...(options ?? {}),
      path: options?.path ?? '/socket.io',
      connectionStateRecovery: {
        maxDisconnectionDuration: this.partySessionRecoveryWindowMs,
        skipMiddlewares: false,
      },
      cors: this.createCorsOptions(),
    };

    const server = super.createIOServer(port, serverOptions as IoServerOptions);

    server.use((socket: IoSocket, next: IoNext) => {
      void this.authenticateSocketConnection(socket, next);
    });

    return server;
  }

  private async authenticateSocketConnection(socket: IoSocket, next: IoNext): Promise<void> {
    try {
      const token = this.extractBearerToken(socket);

      if (!token) {
        next();
        return;
      }

      const payload = await this.sessions.authenticate(token);
      socket.data.authenticatedUserId = payload.id;
      socket.use(async (_packet, nextPacket) => {
        try {
          await this.sessions.authenticate(token);
          nextPacket();
        } catch {
          nextPacket(new UnauthorizedError({ reason: 'socketPacketSessionRevoked' }));
          socket.disconnect(true);
        }
      });

      const checkSession = setInterval(() => {
        void this.sessions.authenticate(token, false).catch(() => socket.disconnect(true));
      }, 15_000);

      checkSession.unref();
      socket.once('disconnect', () => clearInterval(checkSession));
      next();
    } catch (error) {
      next(error instanceof Error ? error : new UnauthorizedError({ reason: 'socketAuthenticationFailed' }));
    }
  }

  private createCorsOptions(): NonNullable<ResolvedIoServerOptions['cors']> {
    return {
      ...this.corsOptions,
      origin: this.corsOptions.origin === '*' ? '*' : [...this.corsOptions.origin],
    };
  }

  private extractBearerToken(socket: IoSocket): string | null {
    const authToken = this.parseAuthorizationValue(socket.handshake.auth?.authorization);

    if (authToken) {
      return authToken;
    }

    return this.parseAuthorizationValue(socket.handshake.headers.authorization);
  }

  private parseAuthorizationValue(value: unknown): string | null {
    if (value === undefined) return null;
    if (typeof value !== 'string') throw new UnauthorizedError({ reason: 'invalidSocketAuthorizationType' });

    const [scheme, token, extra] = value.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token || extra !== undefined) {
      throw new UnauthorizedError({ reason: 'invalidSocketAuthorizationFormat' });
    }

    return token;
  }
}
