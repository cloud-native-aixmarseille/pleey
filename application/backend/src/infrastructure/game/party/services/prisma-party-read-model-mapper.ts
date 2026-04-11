import { Injectable } from '@nestjs/common';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../application/identity/shared/services/identifiers/user-identifier';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../domain/game/party/enums/party-status.enum';
import type { PartyPlayer } from '../../../../domain/game/party/player/entities/party-player';
import {
  PARTY_PLAYER_ACTION_STATE_STATUS,
  type PartyPlayerActionState,
} from '../../../../domain/game/party/player/entities/party-player-action-state';
import type { PartyPlayerIdentity } from '../../../../domain/game/party/player/entities/party-player-identity';
import type { PlayerPartyObservationPlayer } from '../../../../domain/game/party/player/entities/player-party-observation';
import {
  type PartyRuntimeContext,
  PartyRuntimePhase,
} from '../../../../domain/game/party/shared/entities/party-runtime-context';
import type { GuestId } from '../../../../domain/identity/entities/guest';
import type { UserId } from '../../../../domain/identity/entities/user';

interface PersistedPartyPlayerScoreRow {
  readonly context?: unknown;
  readonly createdAt: Date;
  readonly points?: number;
  readonly user: {
    readonly id: UserId;
    readonly username: string;
    readonly avatar: {
      readonly updatedAt: Date;
    } | null;
  } | null;
  readonly guest: {
    readonly id: GuestId;
    readonly username: string;
    readonly createdAt?: Date;
  } | null;
}

interface PersistedPartyPlayerScoreSourceRow {
  readonly context?: unknown;
  readonly createdAt: Date;
  readonly points?: number;
  readonly user: {
    readonly id: number;
    readonly username: string;
    readonly avatar: {
      readonly updatedAt: Date;
    } | null;
  } | null;
  readonly guest: {
    readonly id: string;
    readonly username: string;
    readonly createdAt?: Date;
  } | null;
}

interface PartyPlayerSummary {
  readonly avatarUri: string | null;
  readonly identity: PartyPlayerIdentity;
  readonly joinedAt: Date;
  totalScore: number;
  readonly username: string;
}

@Injectable()
export class PrismaPartyReadModelMapper {
  constructor(
    private readonly partyActionIdentifier: PartyActionIdentifier,
    private readonly partyStageIdentifier: PartyStageIdentifier,
    private readonly guestIdentifier: GuestIdentifier,
    private readonly userIdentifier: UserIdentifier,
  ) {}

  collectPlayers(
    scores: readonly PersistedPartyPlayerScoreRow[],
    options: {
      readonly excludedUserId?: UserId;
      readonly resolveGuestJoinedAt?: (score: PersistedPartyPlayerScoreRow) => Date;
    } = {},
  ): readonly PartyPlayerSummary[] {
    const players = new Map<string, PartyPlayerSummary>();

    for (const score of scores) {
      if (score.user) {
        if (score.user.id === options.excludedUserId) {
          continue;
        }

        const identity: PartyPlayerIdentity = {
          kind: PartyPlayerKind.USER,
          userId: this.userIdentifier.parse(score.user.id),
        };
        const playerKey = this.toPlayerKey(identity);
        const existing = players.get(playerKey);

        if (existing) {
          existing.totalScore += score.points ?? 0;
          continue;
        }

        players.set(playerKey, {
          avatarUri: this.toUserAvatarUri(score.user.id, score.user.avatar?.updatedAt ?? null),
          identity,
          joinedAt: score.createdAt,
          totalScore: score.points ?? 0,
          username: score.user.username,
        });
        continue;
      }

      if (score.guest) {
        const identity: PartyPlayerIdentity = {
          kind: PartyPlayerKind.GUEST,
          guestId: this.guestIdentifier.parse(score.guest.id),
        };
        const playerKey = this.toPlayerKey(identity);
        const existing = players.get(playerKey);

        if (existing) {
          existing.totalScore += score.points ?? 0;
          continue;
        }

        players.set(playerKey, {
          avatarUri: this.toGuestAvatarUri(score.guest.id),
          identity,
          joinedAt: options.resolveGuestJoinedAt?.(score) ?? score.createdAt,
          totalScore: score.points ?? 0,
          username: score.guest.username,
        });
      }
    }

    return [...players.values()].sort(
      (left, right) => left.joinedAt.getTime() - right.joinedAt.getTime(),
    );
  }

  normalizePlayerScores(
    scores: readonly PersistedPartyPlayerScoreSourceRow[],
  ): readonly PersistedPartyPlayerScoreRow[] {
    return scores.map((score) => ({
      ...score,
      user: score.user
        ? {
            ...score.user,
            id: this.userIdentifier.parse(score.user.id),
          }
        : null,
      guest: score.guest
        ? {
            ...score.guest,
            id: this.guestIdentifier.parse(score.guest.id),
          }
        : null,
    }));
  }

  collectPlayerActionStates(
    scores: readonly PersistedPartyPlayerScoreRow[],
    options: {
      readonly excludedUserId?: UserId;
    } = {},
  ): readonly {
    readonly identity: PartyPlayerIdentity;
    readonly state: PartyPlayerActionState;
  }[] {
    const actionStates: {
      readonly identity: PartyPlayerIdentity;
      readonly state: PartyPlayerActionState;
    }[] = [];

    for (const score of scores) {
      const state = this.toPartyPlayerActionState(score.context);

      if (!state) {
        continue;
      }

      if (score.user) {
        if (score.user.id === options.excludedUserId) {
          continue;
        }

        actionStates.push({
          identity: {
            kind: PartyPlayerKind.USER,
            userId: this.userIdentifier.parse(score.user.id),
          },
          state,
        });
        continue;
      }

      if (score.guest) {
        actionStates.push({
          identity: {
            kind: PartyPlayerKind.GUEST,
            guestId: this.guestIdentifier.parse(score.guest.id),
          },
          state,
        });
      }
    }

    return actionStates;
  }

  toPartyPlayer(player: PartyPlayerSummary): PartyPlayer {
    if (player.identity.kind === PartyPlayerKind.USER) {
      return {
        avatarUri: player.avatarUri,
        identity: {
          kind: PartyPlayerKind.USER,
          userId: player.identity.userId,
        },
        joinedAt: player.joinedAt,
        totalScore: player.totalScore,
        username: player.username,
      };
    }

    return {
      avatarUri: player.avatarUri,
      identity: {
        kind: PartyPlayerKind.GUEST,
        guestId: player.identity.guestId,
      },
      joinedAt: player.joinedAt,
      totalScore: player.totalScore,
      username: player.username,
    };
  }

  toPlayerObservationPlayer(player: PartyPlayerSummary): PlayerPartyObservationPlayer {
    return {
      avatarUri: player.avatarUri,
      identity: player.identity,
      totalScore: player.totalScore,
      username: player.username,
    };
  }

  toPartyStatus(
    status: string,
    options: {
      readonly unknownStatus?: 'waiting' | 'validation-error';
    } = {},
  ): PartyStatus {
    const normalizedStatus = status.trim().toUpperCase();

    if (normalizedStatus === 'HOST') {
      if (options.unknownStatus === 'validation-error') {
        throw new Error(GameErrorCode.VALIDATION_FAILED);
      }

      throw new Error('Unexpected party role value while reading party status.');
    }

    switch (normalizedStatus) {
      case PartyStatus.WAITING:
        return PartyStatus.WAITING;
      case PartyStatus.ACTIVE:
        return PartyStatus.ACTIVE;
      case PartyStatus.PAUSED:
        return PartyStatus.PAUSED;
      case PartyStatus.ENDED:
        return PartyStatus.ENDED;
      default:
        if (options.unknownStatus === 'validation-error') {
          throw new Error(GameErrorCode.VALIDATION_FAILED);
        }

        return PartyStatus.WAITING;
    }
  }

  toPersistedPartyStatus(status: PartyStatus): 'waiting' | 'active' | 'paused' | 'ended' {
    switch (status) {
      case PartyStatus.WAITING:
        return 'waiting';
      case PartyStatus.ACTIVE:
        return 'active';
      case PartyStatus.PAUSED:
        return 'paused';
      case PartyStatus.ENDED:
        return 'ended';
    }
  }

  toPartyRuntimeContext(value: unknown): PartyRuntimeContext | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    const lifecycle = Reflect.get(value, 'lifecycle');

    if (!lifecycle || typeof lifecycle !== 'object' || Array.isArray(lifecycle)) {
      return null;
    }

    const phase = Reflect.get(lifecycle, 'phase');
    const stageId = Reflect.get(lifecycle, 'stageId');
    const stagePosition = Reflect.get(lifecycle, 'stagePosition');
    const totalStages = Reflect.get(lifecycle, 'totalStages');

    if (!Object.values(PartyRuntimePhase).includes(phase as never)) {
      return null;
    }

    const normalizedStageId =
      stageId === null ? null : this.partyStageIdentifier.parseOrNull(stageId);

    if (stageId !== null && normalizedStageId === null) {
      return null;
    }

    if (stagePosition !== null && (!Number.isInteger(stagePosition) || Number(stagePosition) < 0)) {
      return null;
    }

    if ((stageId === null) !== (stagePosition === null)) {
      return null;
    }

    if (!Number.isInteger(totalStages) || Number(totalStages) < 0) {
      return null;
    }

    const stage = this.toPartyRuntimeStageContext(Reflect.get(value, 'stage'));
    const result = this.toPartyRuntimeResultContext(Reflect.get(value, 'result'));

    return {
      lifecycle: {
        phase,
        stageId: normalizedStageId,
        stagePosition: stagePosition === null ? null : Number(stagePosition),
        totalStages: Number(totalStages),
      },
      ...(stage ? { stage } : {}),
      ...(result ? { result } : {}),
    };
  }

  toPartyPlayerActionState(value: unknown): PartyPlayerActionState | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    const selectedActionId = Reflect.get(value, 'selectedActionId');
    const stageId = Reflect.get(value, 'stageId');
    const stagePosition = Reflect.get(value, 'stagePosition');
    const status = Reflect.get(value, 'status');

    const normalizedSelectedActionId = this.partyActionIdentifier.parseOrNull(selectedActionId);

    if (normalizedSelectedActionId === null) {
      return null;
    }

    const normalizedStageId = this.partyStageIdentifier.parseOrNull(stageId);

    if (normalizedStageId === null) {
      return null;
    }

    if (!Number.isInteger(stagePosition) || Number(stagePosition) < 0) {
      return null;
    }

    if (!Object.values(PARTY_PLAYER_ACTION_STATE_STATUS).includes(status as never)) {
      return null;
    }

    return {
      selectedActionId: normalizedSelectedActionId,
      stageId: normalizedStageId,
      stagePosition: Number(stagePosition),
      status,
    };
  }

  toUserAvatarUri(userId: UserId, updatedAt: Date | null): string | null {
    if (!updatedAt) {
      return null;
    }

    return `/api/avatars/users/${encodeURIComponent(String(userId))}?v=${updatedAt.getTime()}`;
  }

  toGuestAvatarUri(guestId: GuestId): string {
    return `/api/avatars/guests/${encodeURIComponent(guestId)}`;
  }

  private toPlayerKey(identity: PartyPlayerIdentity): string {
    return identity.kind === PartyPlayerKind.USER
      ? `user:${identity.userId}`
      : `guest:${identity.guestId}`;
  }

  private toPartyRuntimeStageContext(value: unknown): PartyRuntimeContext['stage'] | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const actionSubmission = Reflect.get(value, 'actionSubmission');
    const current = Reflect.get(value, 'current');
    const normalizedActionSubmission = this.toPartyRuntimeActionSubmissionContext(actionSubmission);
    const normalizedCurrent = this.toPartyRuntimeCurrentStageContext(current);

    if (normalizedActionSubmission === undefined && normalizedCurrent === undefined) {
      return undefined;
    }

    return {
      actionSubmission: normalizedActionSubmission ?? null,
      current: normalizedCurrent ?? null,
    };
  }

  private toPartyRuntimeResultContext(value: unknown): PartyRuntimeContext['result'] | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const current = this.toPartyRuntimeCurrentResultContext(Reflect.get(value, 'current'));
    const currentPlayer = this.toPartyRuntimeCurrentPlayerResultContext(
      Reflect.get(value, 'currentPlayer'),
    );

    if (current === undefined && currentPlayer === undefined) {
      return undefined;
    }

    return {
      current: current ?? null,
      currentPlayer: currentPlayer ?? null,
    };
  }

  private toPartyRuntimeActionSubmissionContext(
    value: unknown,
  ): NonNullable<PartyRuntimeContext['stage']>['actionSubmission'] | undefined {
    if (value === null) {
      return null;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const submittedPlayerCount = Reflect.get(value, 'submittedPlayerCount');
    const totalEligiblePlayerCount = Reflect.get(value, 'totalEligiblePlayerCount');

    if (!Number.isInteger(submittedPlayerCount) || Number(submittedPlayerCount) < 0) {
      return undefined;
    }

    if (!Number.isInteger(totalEligiblePlayerCount) || Number(totalEligiblePlayerCount) < 0) {
      return undefined;
    }

    return {
      currentPlayer:
        this.toPartyRuntimeCurrentPlayerActionSubmissionContext(
          Reflect.get(value, 'currentPlayer'),
        ) ?? null,
      submittedPlayerCount: Number(submittedPlayerCount),
      totalEligiblePlayerCount: Number(totalEligiblePlayerCount),
    };
  }

  private toPartyRuntimeCurrentPlayerActionSubmissionContext(
    value: unknown,
  ):
    | NonNullable<NonNullable<PartyRuntimeContext['stage']>['actionSubmission']>['currentPlayer']
    | undefined {
    if (value === null) {
      return null;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const selectedActionId = Reflect.get(value, 'selectedActionId');
    const status = Reflect.get(value, 'status');

    const normalizedSelectedActionId = this.partyActionIdentifier.parseOrNull(selectedActionId);

    if (normalizedSelectedActionId === null) {
      return undefined;
    }

    if (!Object.values(PARTY_PLAYER_ACTION_STATE_STATUS).includes(status as never)) {
      return undefined;
    }

    return {
      selectedActionId: normalizedSelectedActionId,
      status,
    };
  }

  private toPartyRuntimeCurrentStageContext(
    value: unknown,
  ): NonNullable<PartyRuntimeContext['stage']>['current'] | undefined {
    if (value === null) {
      return null;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const stageId = Reflect.get(value, 'stageId');
    const stagePosition = Reflect.get(value, 'stagePosition');
    const text = Reflect.get(value, 'text');
    const actions = Reflect.get(value, 'actions');

    const normalizedStageId = this.partyStageIdentifier.parseOrNull(stageId);

    if (
      normalizedStageId === null ||
      !Number.isInteger(stagePosition) ||
      Number(stagePosition) < 0 ||
      typeof text !== 'string'
    ) {
      return undefined;
    }

    if (!Array.isArray(actions)) {
      return undefined;
    }

    const normalizedActions = actions
      .map((action) => this.toPartyRuntimeStageActionContext(action))
      .filter((action) => action !== undefined);

    if (normalizedActions.length !== actions.length) {
      return undefined;
    }

    return {
      actions: normalizedActions,
      stageId: normalizedStageId,
      stagePosition: Number(stagePosition),
      text,
    };
  }

  private toPartyRuntimeStageActionContext(
    value: unknown,
  ):
    | NonNullable<NonNullable<PartyRuntimeContext['stage']>['current']>['actions'][number]
    | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const id = Reflect.get(value, 'id');
    const text = Reflect.get(value, 'text');

    const normalizedActionId = this.partyActionIdentifier.parseOrNull(id);

    if (normalizedActionId === null || typeof text !== 'string') {
      return undefined;
    }

    return {
      id: normalizedActionId,
      text,
    };
  }

  private toPartyRuntimeCurrentResultContext(
    value: unknown,
  ): NonNullable<PartyRuntimeContext['result']>['current'] | undefined {
    if (value === null) {
      return null;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const stageId = Reflect.get(value, 'stageId');
    const stagePosition = Reflect.get(value, 'stagePosition');
    const text = Reflect.get(value, 'text');
    const actions = Reflect.get(value, 'actions');

    const normalizedStageId = this.partyStageIdentifier.parseOrNull(stageId);

    if (
      normalizedStageId === null ||
      !Number.isInteger(stagePosition) ||
      Number(stagePosition) < 0 ||
      typeof text !== 'string'
    ) {
      return undefined;
    }

    if (!Array.isArray(actions)) {
      return undefined;
    }

    const normalizedActions = actions
      .map((action) => this.toPartyRuntimeResultActionContext(action))
      .filter((action) => action !== undefined);

    if (normalizedActions.length !== actions.length) {
      return undefined;
    }

    return {
      actions: normalizedActions,
      stageId: normalizedStageId,
      stagePosition: Number(stagePosition),
      text,
    };
  }

  private toPartyRuntimeResultActionContext(
    value: unknown,
  ):
    | NonNullable<NonNullable<PartyRuntimeContext['result']>['current']>['actions'][number]
    | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const actionCount = Reflect.get(value, 'actionCount');
    const actionPercent = Reflect.get(value, 'actionPercent');
    const earnedPoints = Reflect.get(value, 'earnedPoints');
    const id = Reflect.get(value, 'id');
    const isCorrect = Reflect.get(value, 'isCorrect');
    const text = Reflect.get(value, 'text');

    const normalizedActionId = this.partyActionIdentifier.parseOrNull(id);

    if (
      !Number.isInteger(actionCount) ||
      Number(actionCount) < 0 ||
      !Number.isInteger(actionPercent) ||
      Number(actionPercent) < 0 ||
      !Number.isInteger(earnedPoints) ||
      Number(earnedPoints) < 0 ||
      normalizedActionId === null ||
      typeof isCorrect !== 'boolean' ||
      typeof text !== 'string'
    ) {
      return undefined;
    }

    return {
      actionCount: Number(actionCount),
      actionPercent: Number(actionPercent),
      earnedPoints: Number(earnedPoints),
      id: normalizedActionId,
      isCorrect,
      text,
    };
  }

  private toPartyRuntimeCurrentPlayerResultContext(
    value: unknown,
  ): NonNullable<PartyRuntimeContext['result']>['currentPlayer'] | undefined {
    if (value === null) {
      return null;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const earnedPoints = Reflect.get(value, 'earnedPoints');
    const isCorrect = Reflect.get(value, 'isCorrect');
    const selectedActionId = Reflect.get(value, 'selectedActionId');

    const normalizedSelectedActionId = this.partyActionIdentifier.parseOrNull(selectedActionId);

    if (
      !Number.isInteger(earnedPoints) ||
      Number(earnedPoints) < 0 ||
      typeof isCorrect !== 'boolean' ||
      normalizedSelectedActionId === null
    ) {
      return undefined;
    }

    return {
      earnedPoints: Number(earnedPoints),
      isCorrect,
      selectedActionId: normalizedSelectedActionId,
    };
  }
}
