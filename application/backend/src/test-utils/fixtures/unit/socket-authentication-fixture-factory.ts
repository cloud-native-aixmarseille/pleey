import { IoAdapter } from '@nestjs/platform-socket.io';
import { vi } from 'vitest';
import { ConfiguredIoAdapter } from '../../../app/config/configured-io-adapter';
import { backendTestIdentifiers } from '../../branded-identifiers';

export class SocketAuthenticationFixtureFactory {
  create(authorization?: unknown) {
    const server = { use: vi.fn() };
    const createServer = vi.spyOn(IoAdapter.prototype, 'createIOServer').mockReturnValue(server as never);
    const sessions = { authenticate: vi.fn().mockResolvedValue({ id: backendTestIdentifiers.user(1) }) };
    const app = { get: vi.fn().mockReturnValue(sessions) };
    const adapter = new ConfiguredIoAdapter(app as never, { origin: '*', credentials: false }, 1000);
    adapter.createIOServer(0);
    const socket = {
      handshake: { auth: { authorization }, headers: {} },
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
