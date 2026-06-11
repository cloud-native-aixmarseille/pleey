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
import {
  isEndedPartyRuntimeContext,
  isResultPartyRuntimeContext,
  isStagePartyRuntimeContext,
  PartyRuntimePhase,
} from '../../../../domains/game/party/shared/entities/party-runtime-context';
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

    if (context.lifecycle.phase === PartyRuntimePhase.LOBBY) {
      return {
        lifecycle: {
          phase: context.lifecycle.phase,
          stageEndsAtEpochMs: context.lifecycle.stageEndsAtEpochMs,
          stageId: context.lifecycle.stageId,
          stagePosition: context.lifecycle.stagePosition,
          stageRemainingDurationMs: context.lifecycle.stageRemainingDurationMs,
          stageTimeLimitSeconds: context.lifecycle.stageTimeLimitSeconds,
          totalStages: context.lifecycle.totalStages,
        },
      };
    }

    if (isStagePartyRuntimeContext(context)) {
      const stageContext = context;
      const actionSubmission = stageContext.stage?.actionSubmission;
      const currentStage = stageContext.stage?.current;

      if (!actionSubmission || !currentStage) {
        return null;
      }

      return {
        lifecycle: {
          phase: stageContext.lifecycle.phase,
          stageEndsAtEpochMs: stageContext.lifecycle.stageEndsAtEpochMs,
          stageId: stageContext.lifecycle.stageId,
          stagePosition: stageContext.lifecycle.stagePosition,
          stageRemainingDurationMs: stageContext.lifecycle.stageRemainingDurationMs,
          stageTimeLimitSeconds: stageContext.lifecycle.stageTimeLimitSeconds,
          totalStages: stageContext.lifecycle.totalStages,
        },
        stage: {
          actionSubmission: {
            currentPlayer: actionSubmission.currentPlayer
              ? {
                  selectedActionId: this.partyActionIdentifier.parse(
                    actionSubmission.currentPlayer.selectedActionId,
                  ),
                  status: actionSubmission.currentPlayer.status,
                }
              : null,
            submittedPlayerCount: actionSubmission.submittedPlayerCount,
            totalEligiblePlayerCount: actionSubmission.totalEligiblePlayerCount,
          },
          current: {
            actions: currentStage.actions.map((action) => this.toStageActionContext(action)),
            text: currentStage.text,
          },
        },
      };
    }

    if (isResultPartyRuntimeContext(context)) {
      const resultContext = context;
      const currentResult = resultContext.result?.current;

      if (!currentResult) {
        return null;
      }

      return {
        lifecycle: {
          phase: resultContext.lifecycle.phase,
          stageEndsAtEpochMs: resultContext.lifecycle.stageEndsAtEpochMs,
          stageId: resultContext.lifecycle.stageId,
          stagePosition: resultContext.lifecycle.stagePosition,
          stageRemainingDurationMs: resultContext.lifecycle.stageRemainingDurationMs,
          stageTimeLimitSeconds: resultContext.lifecycle.stageTimeLimitSeconds,
          totalStages: resultContext.lifecycle.totalStages,
        },
        result: {
          current: {
            actions: currentResult.actions.map((action) => this.toResultActionContext(action)),
            text: currentResult.text,
          },
          currentPlayer: resultContext.result.currentPlayer
            ? {
                earnedPoints: resultContext.result.currentPlayer.earnedPoints,
                isCorrect: resultContext.result.currentPlayer.isCorrect,
                selectedActionId: this.partyActionIdentifier.parse(
                  resultContext.result.currentPlayer.selectedActionId,
                ),
              }
            : null,
        },
      };
    }

    if (isEndedPartyRuntimeContext(context)) {
      const endedContext = context;
      const currentResult = endedContext.result?.current;

      return {
        lifecycle: {
          phase: endedContext.lifecycle.phase,
          stageEndsAtEpochMs: endedContext.lifecycle.stageEndsAtEpochMs,
          stageId: endedContext.lifecycle.stageId,
          stagePosition: endedContext.lifecycle.stagePosition,
          stageRemainingDurationMs: endedContext.lifecycle.stageRemainingDurationMs,
          stageTimeLimitSeconds: endedContext.lifecycle.stageTimeLimitSeconds,
          totalStages: endedContext.lifecycle.totalStages,
        },
        ...(endedContext.result && currentResult
          ? {
              result: {
                current: {
                  actions: currentResult.actions.map((action) =>
                    this.toResultActionContext(action),
                  ),
                  text: currentResult.text,
                },
                currentPlayer: endedContext.result.currentPlayer
                  ? {
                      earnedPoints: endedContext.result.currentPlayer.earnedPoints,
                      isCorrect: endedContext.result.currentPlayer.isCorrect,
                      selectedActionId: this.partyActionIdentifier.parse(
                        endedContext.result.currentPlayer.selectedActionId,
                      ),
                    }
                  : null,
              },
            }
          : {}),
      };
    }

    return null;
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
      correctStages: player.correctStages,
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
