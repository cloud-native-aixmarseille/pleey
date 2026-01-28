import { injectable } from 'inversify';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '../../../app/config/api';

interface SocketAuthPayload {
  readonly authorization?: string;
}

@injectable()
export class SocketIoGameSessionConnection {
  private client: Socket | null = null;
  private accessToken: string | null = null;

  setAuthSessionTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void {
    this.accessToken = tokens.accessToken;

    if (this.client) {
      this.client.auth = this.buildAuthPayload();
    }
  }

  emit<TPayload>(eventName: string, payload: TPayload): void {
    const client = this.ensureConnected();

    client.emit(eventName, payload);
  }

  async emitWithAck<TPayload, TAck>(
    eventName: string,
    payload: TPayload,
    timeoutMs = 5000,
  ): Promise<TAck> {
    const client = this.ensureConnected();

    return client.timeout(timeoutMs).emitWithAck(eventName, payload) as Promise<TAck>;
  }

  on(eventName: string, handler: (...args: unknown[]) => void): void {
    this.getClient().on(eventName, handler as never);
  }

  off(eventName: string, handler: (...args: unknown[]) => void): void {
    this.getClient().off(eventName, handler as never);
  }

  observeSession(pin: string): void {
    this.emit('observe-session', { pin });
  }

  disconnect(): void {
    const client = this.getClient();

    if (client.connected) {
      client.disconnect();
    }
  }

  private ensureConnected(): Socket {
    const client = this.getClient();

    if (!client.connected) {
      client.connect();
    }

    return client;
  }

  private getClient(): Socket {
    if (this.client === null) {
      this.client = io(SOCKET_URL, {
        autoConnect: false,
        auth: this.buildAuthPayload(),
        withCredentials: true,
      });
    }

    return this.client;
  }

  private buildAuthPayload(): SocketAuthPayload {
    if (!this.accessToken) {
      return {};
    }

    return {
      authorization: `Bearer ${this.accessToken}`,
    };
  }
}
