import { inject, injectable } from 'inversify';
import { io, type Socket } from 'socket.io-client';
import { PartyIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-identifier';
import type { PartyId } from '../../../../domains/game/party/shared/entities/party';
import { PartyManagementErrorCode } from '../../../../domains/game/party/shared/errors/party-management-error-code';
import { SOCKET_URL } from '../../../config/api';
import type {
  ObservePartyPayload,
  PartyJoinMessage,
  SocketExceptionPayload,
  SocketIoPartyHostCommandEventName,
  SocketIoPartyObservationTransportHandlers,
  SocketIoPartyPlayerCommand,
  SocketPartyEntryPayload,
  SocketPartyHostPlayerPayload,
} from './socket-io-party-realtime.types';
import {
  SocketIoPartyInboundEventName,
  SocketIoPartyJoinEventName,
  SocketIoPartyObservationEventName,
} from './socket-io-party-realtime.types';

interface RequestObservationOptions {
  readonly force?: boolean;
}

interface PendingHostCommand {
  readonly reject: (error: Error) => void;
}

interface PendingPlayerCommand {
  readonly reject: (error: Error) => void;
}

@injectable()
export class SocketIoPartyRealtimeTransport {
  constructor(
    @inject(PartyIdentifier)
    private readonly partyIdentifier: PartyIdentifier,
  ) {}

  private accessToken: string | null = null;
  private socket: Socket | null = null;
  private readonly activePartyObservationIds = new Set<PartyId>();
  private lastRequestedPartyId: PartyId | null = null;
  private readonly pendingHostCommands = new Set<PendingHostCommand>();
  private readonly pendingPlayerCommands = new Set<PendingPlayerCommand>();
  private readonly subscriptions = new Map<
    PartyId,
    Set<SocketIoPartyObservationTransportHandlers>
  >();

  observeParty(partyId: PartyId, handlers: SocketIoPartyObservationTransportHandlers): () => void {
    const listeners =
      this.subscriptions.get(partyId) ?? new Set<SocketIoPartyObservationTransportHandlers>();

    listeners.add(handlers);
    this.subscriptions.set(partyId, listeners);

    this.ensureConnected();
    this.requestObservation(partyId);

    return () => {
      const currentListeners = this.subscriptions.get(partyId);

      if (!currentListeners) {
        return;
      }

      currentListeners.delete(handlers);

      if (currentListeners.size === 0) {
        this.subscriptions.delete(partyId);
        this.activePartyObservationIds.delete(partyId);
        this.socket?.emit(SocketIoPartyObservationEventName.StopObservingParty);
      }

      if (this.subscriptions.size === 0) {
        this.socket?.disconnect();
      }
    };
  }

  setAuthSessionTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void {
    this.accessToken = tokens.accessToken;

    if (!this.socket || this.subscriptions.size === 0) {
      return;
    }

    this.socket.auth = this.buildAuthPayload();
    this.socket.disconnect();
    this.socket.connect();
  }

  async dispatchPartyJoinCommand(
    eventName: SocketIoPartyJoinEventName.JoinParty | SocketIoPartyJoinEventName.RejoinParty,
    payload: SocketPartyEntryPayload,
  ): Promise<PartyJoinMessage> {
    this.ensureConnected();

    return this.emitWithAcknowledgement<PartyJoinMessage>(eventName, payload);
  }

  async leaveParty(): Promise<boolean> {
    this.ensureConnected();

    const result = await this.emitWithAcknowledgement<{ left: boolean }>(
      SocketIoPartyJoinEventName.LeaveParty,
    );

    return result.left;
  }

  dispatchPlayerCommand(command: SocketIoPartyPlayerCommand): Promise<void> {
    this.ensureConnected();
    this.lastRequestedPartyId = command.command.partyId;

    return new Promise((resolve, reject) => {
      const pendingPlayerCommand: PendingPlayerCommand = {
        reject: (error) => reject(error),
      };

      this.pendingPlayerCommands.add(pendingPlayerCommand);
      this.socket?.emit(command.eventName, command.command, () => {
        this.pendingPlayerCommands.delete(pendingPlayerCommand);
        resolve();
      });
    });
  }

  dispatchHostCommand(
    eventName: SocketIoPartyHostCommandEventName,
    payload: { readonly partyId: PartyId } | SocketPartyHostPlayerPayload,
  ): Promise<void> {
    this.ensureConnected();
    this.lastRequestedPartyId = payload.partyId;

    return new Promise((resolve, reject) => {
      const pendingHostCommand: PendingHostCommand = {
        reject: (error) => reject(error),
      };

      this.pendingHostCommands.add(pendingHostCommand);
      this.socket?.emit(eventName, payload, () => {
        this.pendingHostCommands.delete(pendingHostCommand);
        this.requestObservation(payload.partyId, { force: true });
        resolve();
      });
    });
  }

  private ensureConnected(): void {
    const socket = this.getOrCreateSocket();

    if (!socket.connected) {
      socket.connect();
    }
  }

  private getOrCreateSocket(): Socket {
    if (this.socket) {
      return this.socket;
    }

    const socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: this.buildAuthPayload(),
    });

    socket.on(SocketIoPartyInboundEventName.Connect, () => {
      this.activePartyObservationIds.clear();

      for (const partyId of this.subscriptions.keys()) {
        this.requestObservation(partyId);
      }
    });

    socket.on(SocketIoPartyInboundEventName.Disconnect, () => {
      this.activePartyObservationIds.clear();
    });

    socket.on(SocketIoPartyInboundEventName.PartySnapshot, (payload) => {
      this.dispatchSnapshot(payload);
    });

    socket.on(SocketIoPartyInboundEventName.PartyUpdated, (payload) => {
      this.dispatchSnapshot(payload);
    });

    socket.on(SocketIoPartyInboundEventName.PartyRuntimeNotice, (payload) => {
      this.dispatchRuntimeNotice(payload);
    });

    socket.on(SocketIoPartyInboundEventName.Exception, (payload: SocketExceptionPayload) => {
      const message = this.resolveSocketMessage(payload);

      for (const pendingHostCommand of this.pendingHostCommands) {
        pendingHostCommand.reject(new Error(message));
      }

      for (const pendingPlayerCommand of this.pendingPlayerCommands) {
        pendingPlayerCommand.reject(new Error(message));
      }

      this.pendingHostCommands.clear();
      this.pendingPlayerCommands.clear();
      this.dispatchError(message, this.lastRequestedPartyId);
    });

    socket.on(SocketIoPartyInboundEventName.ConnectError, () => {
      this.dispatchError(PartyManagementErrorCode.CONNECTION_LOST);
    });

    this.socket = socket;

    return socket;
  }

  private requestObservation(partyId: PartyId, options?: RequestObservationOptions): void {
    if (!options?.force && this.activePartyObservationIds.has(partyId)) {
      return;
    }

    this.lastRequestedPartyId = partyId;
    this.activePartyObservationIds.add(partyId);
    this.socket?.emit(
      SocketIoPartyObservationEventName.ObserveParty,
      this.toObservePartyPayload(partyId),
    );
  }

  private emitWithAcknowledgement<TResponse>(
    eventName:
      | SocketIoPartyHostCommandEventName
      | SocketIoPartyJoinEventName
      | SocketIoPartyPlayerCommand['eventName'],
    payload?: object,
  ): Promise<TResponse> {
    return new Promise((resolve) => {
      if (payload) {
        this.socket?.emit(eventName, payload, (response: TResponse) => resolve(response));
        return;
      }

      this.socket?.emit(eventName, (response: TResponse) => resolve(response));
    });
  }

  private dispatchSnapshot(payload: unknown): void {
    this.forEachPartyListener(payload, (listener) => {
      listener.onSnapshot(payload as never);
    });
  }

  private dispatchError(message: string, partyId?: PartyId | null): void {
    const scopedListeners =
      partyId === null || partyId === undefined ? undefined : this.subscriptions.get(partyId);
    const targets = scopedListeners ? [scopedListeners] : [...this.subscriptions.values()];

    for (const listeners of targets) {
      for (const listener of listeners) {
        listener.onError?.(message);
      }
    }
  }

  private dispatchRuntimeNotice(payload: unknown): void {
    this.forEachPartyListener(payload, (listener) => {
      listener.onRuntimeNotice?.(payload as never);
    });
  }

  private forEachPartyListener(
    payload: unknown,
    callback: (listener: SocketIoPartyObservationTransportHandlers) => void,
  ): void {
    const partyId = this.extractPartyId(payload);

    if (partyId === null) {
      return;
    }

    const listeners = this.subscriptions.get(partyId);

    if (!listeners || listeners.size === 0) {
      return;
    }

    for (const listener of listeners) {
      callback(listener);
    }
  }

  private resolveSocketMessage(payload: SocketExceptionPayload): string {
    if (Array.isArray(payload.message) && typeof payload.message[0] === 'string') {
      return this.toPartyManagementErrorMessage(payload.message[0]);
    }

    if (typeof payload.message === 'string' && payload.message.length > 0) {
      return this.toPartyManagementErrorMessage(payload.message);
    }

    return PartyManagementErrorCode.OBSERVE_FAILED;
  }

  private toPartyManagementErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'HOST_PARTY_CONTROL_FORBIDDEN':
        return PartyManagementErrorCode.HOST_PARTY_CONTROL_FORBIDDEN;
      case 'PARTY_COMMAND_NOT_AVAILABLE':
        return PartyManagementErrorCode.PARTY_COMMAND_NOT_AVAILABLE;
      case 'PARTY_NOT_FOUND':
        return PartyManagementErrorCode.PARTY_NOT_FOUND;
      case 'PARTY_STAGES_NOT_AVAILABLE':
        return PartyManagementErrorCode.PARTY_STAGES_NOT_AVAILABLE;
      case 'VALIDATION_FAILED':
        return PartyManagementErrorCode.VALIDATION_FAILED;
      default:
        return errorCode;
    }
  }

  private buildAuthPayload(): { authorization?: string } {
    return this.accessToken ? { authorization: `Bearer ${this.accessToken}` } : {};
  }

  private toObservePartyPayload(partyId: PartyId): ObservePartyPayload {
    return { partyId };
  }

  private extractPartyId(payload: unknown): PartyId | null {
    if (!payload || typeof payload !== 'object' || !('partyId' in payload)) {
      return null;
    }

    return this.partyIdentifier.parseOrNull(payload.partyId);
  }
}
