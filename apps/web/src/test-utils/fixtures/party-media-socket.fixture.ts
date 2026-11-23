import { vi } from 'vitest';

export class PartyMediaSocketFixture {
  readonly handlers = new Map<string, (payload?: unknown) => void>();
  readonly socket = {
    auth: {},
    connected: true,
    recovered: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn<(event: string, payload?: unknown, acknowledgement?: (grant: unknown) => void) => void>(),
    on: vi.fn((event: string, handler: (payload?: unknown) => void) => {
      this.handlers.set(event, handler);
    }),
  };

  acknowledge(grant: unknown, requestIndex = 0): void {
    const callback = this.socket.emit.mock.calls.filter(([event]) => event === 'request-party-media')[
      requestIndex
    ]?.[2];
    if (!callback) throw new Error('Expected a pending media acknowledgement');
    callback(grant);
  }

  dispatch(event: string, payload?: unknown): void {
    const handler = this.handlers.get(event);
    if (!handler) throw new Error(`Expected a registered ${event} handler`);
    if (event === 'disconnect') this.socket.connected = false;
    handler(payload);
  }
}
