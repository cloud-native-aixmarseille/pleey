import { IoAdapter } from '@nestjs/platform-socket.io';
import { vi } from 'vitest';
import { ConfiguredIoAdapter } from '../../../app/config/configured-io-adapter';
import { backendTestIdentifiers } from '../../branded-identifiers';

interface SocketAuthenticationFixtureOptions {
  readonly authorization?: unknown;
  readonly hasSession?: boolean;
}

export class SocketAuthenticationFixtureFactory {
  create({ authorization, hasSession = false }: SocketAuthenticationFixtureOptions = {}) {
    const server = { use: vi.fn() };
    const createServer = vi.spyOn(IoAdapter.prototype, 'createIOServer').mockReturnValue(server as never);
    const identity = {
      kind: 'valid' as const,
      expiresAt: new Date('2033-05-18T03:33:20.000Z'),
      isAnonymous: true,
      sessionId: 'better-auth-session',
      userId: backendTestIdentifiers.user(1),
    };
    const sessions = {
      getSession: vi.fn().mockResolvedValue(hasSession ? identity : { kind: 'absent' }),
      isSessionRevoked: vi.fn().mockResolvedValue(false),
    };
    const app = { get: vi.fn().mockReturnValue(sessions) };
    const adapter = new ConfiguredIoAdapter(app as never, { origin: '*', credentials: false });
    adapter.createIOServer(0);
    const socket = {
      handshake: { auth: { authorization }, headers: {} },
      request: { headers: { cookie: hasSession ? 'better-auth.session_token=session-cookie' : undefined } },
      data: {},
      use: vi.fn(),
      once: vi.fn(),
      disconnect: vi.fn(),
    };
    const next = vi.fn();
    return {
      socket,
      sessions,
      next,
      connect: () => server.use.mock.calls[0][0](socket, next) as Promise<void>,
      dispose: () => {
        for (const [event, listener] of socket.once.mock.calls) if (event === 'disconnect') listener();
        createServer.mockRestore();
      },
    };
  }
}
