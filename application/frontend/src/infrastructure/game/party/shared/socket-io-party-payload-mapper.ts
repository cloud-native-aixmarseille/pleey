import { inject, injectable } from 'inversify';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeParser } from '../../../../application/game/types/shared/services/game-type-parser';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../application/identity/shared/services/identifiers/user-identifier';
import {
  type PartyJoinReceipt,
  PartyJoinReceiptStatus,
} from '../../../../domains/game/party/player/ports/party-player.port';
import type { PartyObservation } from '../../../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../../../domains/game/party/shared/entities/party-observation-player';
import {
  type PartyPlayerIdentity,
  PartyPlayerIdentityKind,
} from '../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyManagementErrorCode } from '../../../../domains/game/party/shared/errors/party-management-error-code';
import {
  type PartyRuntimeNotice,
  PartyRuntimeNoticeKind,
} from '../../../../domains/game/party/shared/ports/party-observation.port';
import { GameType } from '../../../../domains/game/types/shared/game-type';
import type {
  PartyJoinMessage,
  PartyObservationPayload,
  SocketPartyRuntimeNoticePayload,
} from './socket-io-party-realtime.types';

type PartyRuntimeContextValue = NonNullable<PartyObservation['context']>;
type PartyRuntimeStageActionValue = NonNullable<
  NonNullable<PartyRuntimeContextValue['stage']>['current']
>['actions'][number];
type PartyRuntimeResultActionValue = NonNullable<
  NonNullable<PartyRuntimeContextValue['result']>['current']
>['actions'][number];

@injectable()
export class SocketIoPartyPayloadMapper {
  constructor(
    @inject(PartyActionIdentifier)
    private readonly partyActionIdentifier: PartyActionIdentifier,
    @inject(GuestIdentifier)
    private readonly guestIdentifier: GuestIdentifier,
    @inject(UserIdentifier)
    private readonly userIdentifier: UserIdentifier,
    @inject(PartyIdentifier)
    private readonly partyIdentifier: PartyIdentifier,
    @inject(PartyPinIdentifier)
    private readonly partyPinIdentifier: PartyPinIdentifier,
    @inject(GameIdentifier)
    private readonly gameIdentifier: GameIdentifier,
    @inject(GameTypeParser)
    private readonly gameTypeParser: GameTypeParser,
  ) {}

  toPartyJoinReceipt(response: PartyJoinMessage): PartyJoinReceipt {
    if (response.status === PartyJoinReceiptStatus.REJECTED) {
      return {
        errorMessage: this.resolveJoinErrorMessage(response.errorCode),
        status: PartyJoinReceiptStatus.REJECTED,
      };
    }

    return {
      gameId: this.gameIdentifier.parse(response.gameId),
      player: {
        avatarUri: response.player.avatarUri,
        identity: this.toPlayerIdentity(response.player.identity),
        username: response.player.username,
      },
      partyId: this.partyIdentifier.parse(response.partyId),
      pin: this.normalizePin(response.pin),
      status: PartyJoinReceiptStatus.ACCEPTED,
    };
  }

  toObservation(payload: PartyObservationPayload): PartyObservation {
    return {
      partyId: this.partyIdentifier.parse(payload.partyId),
      gameType: this.parseGameType(payload.gameType),
      pin: this.normalizePin(payload.pin),
      status: payload.status,
      context: this.toRuntimeContext(payload.context),
      isObserverHost: payload.isObserverHost,
      host: {
        avatarUri: payload.host.avatarUri,
        username: payload.host.username,
      },
      players: payload.players.map((player) => this.toObservationPlayer(player)),
    };
  }

  toRuntimeNotice(payload: SocketPartyRuntimeNoticePayload): PartyRuntimeNotice | null {
    const kind = payload.kind;
    const partyId = this.partyIdentifier.parseOrNull(payload.partyId);

    if (
      kind !== PartyRuntimeNoticeKind.RestartStage &&
      kind !== PartyRuntimeNoticeKind.RewindParty &&
      kind !== PartyRuntimeNoticeKind.RewindStage
    ) {
      return null;
    }

    if (partyId === null) {
      return null;
    }

    return {
      kind,
      partyId,
    };
  }

  private toRuntimeContext(context: PartyObservation['context']): PartyObservation['context'] {
    if (!context) {
      return null;
    }

    return {
      lifecycle: context.lifecycle,
      stage: context.stage
        ? {
            actionSubmission: context.stage.actionSubmission
              ? {
                  currentPlayer: context.stage.actionSubmission.currentPlayer
                    ? {
                        selectedActionId: this.partyActionIdentifier.parse(
                          context.stage.actionSubmission.currentPlayer.selectedActionId,
                        ),
                        status: context.stage.actionSubmission.currentPlayer.status,
                      }
                    : null,
                  submittedPlayerCount: context.stage.actionSubmission.submittedPlayerCount,
                  totalEligiblePlayerCount: context.stage.actionSubmission.totalEligiblePlayerCount,
                }
              : null,
            current: context.stage.current
              ? {
                  actions: context.stage.current.actions.map((action) =>
                    this.toStageActionContext(action),
                  ),
                  stageId: context.stage.current.stageId,
                  stagePosition: context.stage.current.stagePosition,
                  text: context.stage.current.text,
                }
              : null,
          }
        : undefined,
      result: context.result
        ? {
            current: context.result.current
              ? {
                  actions: context.result.current.actions.map((action) =>
                    this.toResultActionContext(action),
                  ),
                  stageId: context.result.current.stageId,
                  stagePosition: context.result.current.stagePosition,
                  text: context.result.current.text,
                }
              : null,
            currentPlayer: context.result.currentPlayer
              ? {
                  earnedPoints: context.result.currentPlayer.earnedPoints,
                  isCorrect: context.result.currentPlayer.isCorrect,
                  selectedActionId: this.partyActionIdentifier.parse(
                    context.result.currentPlayer.selectedActionId,
                  ),
                }
              : null,
          }
        : undefined,
    };
  }

  private toStageActionContext(action: PartyRuntimeStageActionValue): PartyRuntimeStageActionValue {
    return {
      id: this.partyActionIdentifier.parse(action.id),
      text: action.text,
    };
  }

  private toResultActionContext(
    action: PartyRuntimeResultActionValue,
  ): PartyRuntimeResultActionValue {
    return {
      actionCount: action.actionCount,
      actionPercent: action.actionPercent,
      earnedPoints: action.earnedPoints,
      id: this.partyActionIdentifier.parse(action.id),
      isCorrect: action.isCorrect,
      text: action.text,
    };
  }

  private parseGameType(gameType: string): GameType {
    const normalizedGameType = this.gameTypeParser.parseOrNull(gameType);

    if (normalizedGameType !== null) {
      return normalizedGameType;
    }

    throw new Error(PartyManagementErrorCode.OBSERVE_FAILED);
  }

  private normalizePin(pin: string): PartyObservation['pin'] {
    return this.partyPinIdentifier.parse(pin);
  }

  private toObservationPlayer(player: PartyObservationPlayer): PartyObservationPlayer {
    return {
      avatarUri: player.avatarUri,
      identity: this.toPlayerIdentity(player.identity),
      isCurrentPlayer: player.isCurrentPlayer,
      isLive: player.isLive,
      totalScore: player.totalScore,
      username: player.username,
    };
  }

  private toPlayerIdentity(identity: PartyPlayerIdentity): PartyPlayerIdentity {
    return identity.kind === PartyPlayerIdentityKind.User
      ? { kind: PartyPlayerIdentityKind.User, userId: this.userIdentifier.parse(identity.userId) }
      : {
          kind: PartyPlayerIdentityKind.Guest,
          guestId: this.guestIdentifier.parse(identity.guestId),
        };
  }

  private resolveJoinErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'PLAYER_ALREADY_IN_ACTIVE_PARTY':
        return PartyManagementErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY;
      case 'PARTY_NOT_FOUND':
        return PartyManagementErrorCode.PARTY_NOT_FOUND;
      case 'VALIDATION_FAILED':
        return PartyManagementErrorCode.VALIDATION_FAILED;
      default:
        return PartyManagementErrorCode.JOIN_FAILED;
    }
  }
}
