import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { AdvanceStageUseCase } from '../../../../application/game/party/host/use-cases/advance-stage-use-case';
import { EndPartyUseCase } from '../../../../application/game/party/host/use-cases/end-party-use-case';
import { PausePartyUseCase } from '../../../../application/game/party/host/use-cases/pause-party-use-case';
import { RestartStageUseCase } from '../../../../application/game/party/host/use-cases/restart-stage-use-case';
import { ResumePartyUseCase } from '../../../../application/game/party/host/use-cases/resume-party-use-case';
import { RevealStageResultUseCase } from '../../../../application/game/party/host/use-cases/reveal-stage-result-use-case';
import { RewindPartyUseCase } from '../../../../application/game/party/host/use-cases/rewind-party-use-case';
import { RewindStageUseCase } from '../../../../application/game/party/host/use-cases/rewind-stage-use-case';
import { StartPartyUseCase } from '../../../../application/game/party/host/use-cases/start-party-use-case';
import type { JoinPartyDto } from '../../../../application/game/party/player/dto/join-party.dto';
import type { SubmitPartyActionDto } from '../../../../application/game/party/player/dto/submit-party-action.dto';
import { JoinPartyUseCase } from '../../../../application/game/party/player/use-cases/join-party-use-case';
import { LeavePartyUseCase } from '../../../../application/game/party/player/use-cases/leave-party-use-case';
import { SubmitPartyActionUseCase } from '../../../../application/game/party/player/use-cases/submit-party-action-use-case';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { BroadcastPartyObservationUseCase } from '../../../../application/game/party/shared/use-cases/broadcast-party-observation-use-case';
import { LoadPartyObservationSnapshotUseCase } from '../../../../application/game/party/shared/use-cases/load-party-observation-snapshot-use-case';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../application/identity/shared/services/identifiers/user-identifier';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../domain/game/party/enums/party-player-kind.enum';
import type {
  AuthenticatedPartyPlayerIdentity,
  PartyPlayerIdentity,
} from '../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyId, PartyPin } from '../../../../domain/game/party/shared/entities/party';
import type { UserId } from '../../../../domain/identity/entities/user';
import { I18nWsExceptionFilter } from '../../../shared/error-handling/i18n-ws-exception-filter';
import {
  PartyEntryMessageDto,
  PartyObservationMessageDto,
  SubmitPartyActionMessageDto,
} from './party-observer-message.dto';
import type { PartyObserverSocketData } from './party-observer-socket-data';
import {
  PARTY_SOCKET_INBOUND_EVENTS,
  type PartyRuntimeNoticeKind,
  resolvePartyObservationRoom,
} from './party-socket-events';
import { SocketPartyObservationBroadcaster } from './services/socket-party-observation-broadcaster';

enum PartyJoinAcknowledgementStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

type PartyJoinAcknowledgement =
  | {
      readonly status: PartyJoinAcknowledgementStatus.ACCEPTED;
      readonly gameId: number;
      readonly player: {
        readonly avatarUri: string | null;
        readonly identity: PartyPlayerIdentity;
        readonly username: string;
      };
      readonly partyId: number;
      readonly pin: PartyPin;
    }
  | {
      readonly errorCode: string;
      readonly status: PartyJoinAcknowledgementStatus.REJECTED;
    };

type PartyHostControlUseCase = Pick<StartPartyUseCase, 'execute'>;

@UseFilters(I18nWsExceptionFilter)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
@WebSocketGateway({ cors: true })
export class PartyObserverGateway implements OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private readonly joinPartyUseCase: JoinPartyUseCase,
    private readonly leavePartyUseCase: LeavePartyUseCase,
    private readonly submitPartyActionUseCase: SubmitPartyActionUseCase,
    private readonly loadPartyObservationSnapshotUseCase: LoadPartyObservationSnapshotUseCase,
    private readonly broadcastPartyObservationUseCase: BroadcastPartyObservationUseCase,
    private readonly partyObservationBroadcaster: SocketPartyObservationBroadcaster,
    private readonly guestIdentifier: GuestIdentifier,
    private readonly partyActionIdentifier: PartyActionIdentifier,
    private readonly partyIdentifier: PartyIdentifier,
    private readonly partyPinIdentifier: PartyPinIdentifier,
    private readonly userIdentifier: UserIdentifier,
    private readonly startPartyUseCase: StartPartyUseCase,
    private readonly advanceStageUseCase: AdvanceStageUseCase,
    private readonly restartStageUseCase: RestartStageUseCase,
    private readonly rewindStageUseCase: RewindStageUseCase,
    private readonly rewindPartyUseCase: RewindPartyUseCase,
    private readonly pausePartyUseCase: PausePartyUseCase,
    private readonly resumePartyUseCase: ResumePartyUseCase,
    private readonly revealStageResultUseCase: RevealStageResultUseCase,
    private readonly endPartyUseCase: EndPartyUseCase,
  ) {}

  afterInit(server: Server): void {
    this.partyObservationBroadcaster.attachServer(server);
  }

  handleDisconnect(client: Socket): void {
    void this.leavePartyObservationRoom(client);
    this.clearJoinedPlayer(client);
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.JOIN_PARTY)
  async joinParty(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: PartyEntryMessageDto | undefined,
  ): Promise<PartyJoinAcknowledgement> {
    return this.handlePartyEntry(client, payload, this.joinPartyUseCase);
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.OBSERVE_PARTY)
  async observeParty(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    try {
      const snapshot = await this.loadPartyObservationSnapshotUseCase.execute({
        partyId: this.normalizePartyId(payload?.partyId),
      });

      await this.leavePartyObservationRoom(client);
      const room = resolvePartyObservationRoom(snapshot.hostObservation.partyId);

      await client.join(room);
      (client.data as PartyObserverSocketData).partyObservationRoom = room;
      await this.partyObservationBroadcaster.emitSnapshot(client, snapshot);
    } catch (error) {
      throw this.toWsException(error);
    }
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.REJOIN_PARTY)
  async rejoinParty(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: PartyEntryMessageDto | undefined,
  ): Promise<PartyJoinAcknowledgement> {
    return this.handlePartyEntry(client, payload, this.joinPartyUseCase);
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.SUBMIT_ACTION)
  async submitAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubmitPartyActionMessageDto | undefined,
  ): Promise<void> {
    try {
      await this.submitPartyActionUseCase.execute(this.toSubmitPartyActionDto(client, payload));
    } catch (error) {
      throw this.toWsException(error);
    }
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.START_PARTY)
  async startParty(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    await this.handleHostPartyCommand(client, payload, this.startPartyUseCase);
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.ADVANCE_STAGE)
  async advanceStage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    await this.handleHostPartyCommand(client, payload, this.advanceStageUseCase);
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.RESTART_STAGE)
  async restartStage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    await this.handleHostPartyCommand(client, payload, this.restartStageUseCase, 'restartStage');
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.REWIND_STAGE)
  async rewindStage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    await this.handleHostPartyCommand(client, payload, this.rewindStageUseCase, 'rewindStage');
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.REWIND_PARTY)
  async rewindParty(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    await this.handleHostPartyCommand(client, payload, this.rewindPartyUseCase, 'rewindParty');
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.PAUSE_PARTY)
  async pauseParty(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    await this.handleHostPartyCommand(client, payload, this.pausePartyUseCase);
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.RESUME_PARTY)
  async resumeParty(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    await this.handleHostPartyCommand(client, payload, this.resumePartyUseCase);
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.REVEAL_STAGE_RESULT)
  async revealStageResult(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    await this.handleHostPartyCommand(client, payload, this.revealStageResultUseCase);
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.END_PARTY)
  async endParty(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PartyObservationMessageDto | undefined,
  ): Promise<void> {
    await this.handleHostPartyCommand(client, payload, this.endPartyUseCase);
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.LEAVE_PARTY)
  async leaveParty(@ConnectedSocket() client: Socket): Promise<{ readonly left: boolean }> {
    const socketData = client.data as PartyObserverSocketData;
    const joinedPartyPlayer = socketData.joinedPartyPlayer;
    const pin = joinedPartyPlayer?.pin;
    const partyObservationId = this.parsePartyObservationId(socketData.partyObservationRoom);

    if (!pin) {
      await this.leavePartyObservationRoom(client);
      this.clearJoinedPlayer(client);
      return { left: false };
    }

    const user = this.resolveAuthenticatedUser(client);
    const left = user
      ? await this.leavePartyUseCase.execute({ pin, playerIdentity: user })
      : joinedPartyPlayer?.identity.kind === PartyPlayerKind.GUEST
        ? await this.leavePartyUseCase.execute({
            pin,
            playerIdentity: joinedPartyPlayer.identity,
          })
        : false;

    await this.leavePartyObservationRoom(client);
    this.clearJoinedPlayer(client);

    if (left && partyObservationId !== null) {
      await this.publishPartyObservationRoom(partyObservationId);
    }

    return { left };
  }

  @SubscribeMessage(PARTY_SOCKET_INBOUND_EVENTS.STOP_OBSERVING_PARTY)
  async stopObservingParty(@ConnectedSocket() client: Socket): Promise<void> {
    await this.leavePartyObservationRoom(client);
  }

  private async leavePartyObservationRoom(client: Socket): Promise<void> {
    const socketData = client.data as PartyObserverSocketData;
    const room = socketData.partyObservationRoom;

    if (!room) {
      return;
    }

    await client.leave(room);
    delete socketData.partyObservationRoom;
  }

  private async handlePartyEntry(
    client: Socket,
    payload: PartyEntryMessageDto | undefined,
    joinPartyUseCase: Pick<JoinPartyUseCase, 'execute'>,
  ): Promise<PartyJoinAcknowledgement> {
    try {
      const result = await joinPartyUseCase.execute(this.toJoinPartyDto(client, payload));

      this.rememberJoinedPlayer(client, result.pin, result.player.identity);
      await this.joinPartyObservationRoom(client, result.partyId);
      await this.publishPartyObservationRoom(result.partyId);

      return {
        status: PartyJoinAcknowledgementStatus.ACCEPTED,
        gameId: result.gameId,
        player: {
          avatarUri: result.player.avatarUri,
          identity: result.player.identity,
          username: result.player.username,
        },
        partyId: result.partyId,
        pin: result.pin,
      };
    } catch (error) {
      return {
        errorCode: error instanceof Error ? error.message : GameErrorCode.UNKNOWN_ERROR,
        status: PartyJoinAcknowledgementStatus.REJECTED,
      };
    }
  }

  private async handleHostPartyCommand(
    client: Socket,
    payload: PartyObservationMessageDto | undefined,
    useCase: PartyHostControlUseCase,
    runtimeNoticeKind?: PartyRuntimeNoticeKind,
  ): Promise<void> {
    const partyId = this.normalizePartyId(payload?.partyId);

    try {
      await useCase.execute({
        hostUserId: this.resolveAuthenticatedHostUserId(client),
        partyId,
      });

      if (runtimeNoticeKind) {
        await this.partyObservationBroadcaster.publishRuntimeNotice(partyId, runtimeNoticeKind);
      }
    } catch (error) {
      throw this.toWsException(error);
    }
  }

  private toJoinPartyDto(client: Socket, payload: PartyEntryMessageDto | undefined): JoinPartyDto {
    const user = this.resolveAuthenticatedUser(client);
    const normalizedPin = this.normalizePin(payload?.pin);

    if (user) {
      return {
        pin: normalizedPin,
        playerIdentity: user,
        username: '',
      };
    }

    const guestId = this.guestIdentifier.parseOrNull(payload?.guestId);

    return {
      pin: normalizedPin,
      playerIdentity:
        guestId === null
          ? { kind: PartyPlayerKind.GUEST }
          : { kind: PartyPlayerKind.GUEST, guestId },
      username: payload?.username?.trim() ?? '',
    };
  }

  private toSubmitPartyActionDto(
    client: Socket,
    payload: SubmitPartyActionMessageDto | undefined,
  ): SubmitPartyActionDto {
    const socketData = client.data as PartyObserverSocketData;
    const joinedPlayerIdentity = socketData.joinedPartyPlayer?.identity;
    const observedPartyId = this.parsePartyObservationId(socketData.partyObservationRoom);
    const partyId = this.normalizePartyId(payload?.partyId);

    if (joinedPlayerIdentity === undefined || observedPartyId !== partyId) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    const actionId = this.partyActionIdentifier.parseOrNull(payload?.actionId);

    if (actionId === null) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    if (joinedPlayerIdentity.kind === PartyPlayerKind.USER) {
      return {
        actionId,
        partyId,
        playerIdentity: joinedPlayerIdentity,
      };
    }

    return {
      actionId,
      partyId,
      playerIdentity: joinedPlayerIdentity,
    };
  }

  private resolveAuthenticatedUser(client: Socket): AuthenticatedPartyPlayerIdentity | null {
    const socketData = client.data as PartyObserverSocketData;
    const userId = this.userIdentifier.parseOrNull(socketData.authenticatedUserId);

    return userId === null ? null : { kind: PartyPlayerKind.USER, userId };
  }

  private resolveAuthenticatedHostUserId(client: Socket): UserId {
    const user = this.resolveAuthenticatedUser(client);

    if (!user) {
      throw new Error(GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN);
    }

    return user.userId;
  }

  private async joinPartyObservationRoom(client: Socket, partyId: PartyId): Promise<void> {
    const snapshot = await this.loadPartyObservationSnapshotUseCase.execute({ partyId });

    await this.leavePartyObservationRoom(client);
    const room = resolvePartyObservationRoom(snapshot.hostObservation.partyId);

    await client.join(room);
    (client.data as PartyObserverSocketData).partyObservationRoom = room;
    await this.partyObservationBroadcaster.emitSnapshot(client, snapshot);
  }

  private async publishPartyObservationRoom(partyId: PartyId): Promise<void> {
    await this.broadcastPartyObservationUseCase.execute({ partyId });
  }

  private parsePartyObservationId(room: string | undefined): PartyId | null {
    if (!room?.startsWith('party:')) {
      return null;
    }

    return this.partyIdentifier.parseOrNull(room.slice('party:'.length));
  }

  private rememberJoinedPlayer(
    client: Socket,
    pin: PartyPin,
    playerIdentity: PartyPlayerIdentity,
  ): void {
    const socketData = client.data as PartyObserverSocketData;

    socketData.joinedPartyPlayer = {
      identity: playerIdentity,
      pin,
    };
  }

  private clearJoinedPlayer(client: Socket): void {
    const socketData = client.data as PartyObserverSocketData;

    delete socketData.joinedPartyPlayer;
  }

  private normalizePin(pin: string | undefined): PartyPin {
    const normalizedPin = this.partyPinIdentifier.parseOrNull(pin);

    if (normalizedPin === null) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    return normalizedPin;
  }

  private normalizePartyId(partyId: number | undefined): PartyId {
    const normalizedPartyId = this.partyIdentifier.parseOrNull(partyId);

    if (normalizedPartyId === null) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    return normalizedPartyId;
  }

  private toWsException(error: unknown): WsException {
    if (error instanceof WsException) {
      return error;
    }

    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    return new WsException(message);
  }
}
