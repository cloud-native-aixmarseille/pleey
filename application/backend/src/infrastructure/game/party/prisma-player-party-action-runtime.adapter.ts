import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type FindPartyActionSubmissionTargetCommand,
  PlayerPartyActionRuntimePort,
  type SavePartyActionSubmissionResultCommand,
} from '../../../application/game/party/player/ports/player-party-action-runtime.port';
import { PartyActionIdentifier } from '../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { GameIdentifier } from '../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeParser } from '../../../application/game/types/shared/services/game-type-parser';
import { GuestIdentifier } from '../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { PartyPlayerKind } from '../../../domain/game/party/enums/party-player-kind.enum';
import type { PartyPlayerActionState } from '../../../domain/game/party/player/entities/party-player-action-state';
import { PARTY_PLAYER_ACTION_STATE_STATUS } from '../../../domain/game/party/player/entities/party-player-action-state';
import type { PartyPlayerIdentity } from '../../../domain/game/party/player/entities/party-player-identity';
import type { PartyActionId } from '../../../domain/game/party/shared/entities/party-action';
import type { PartyRuntimeContext } from '../../../domain/game/party/shared/entities/party-runtime-context';
import type { PartyStageId } from '../../../domain/game/party/shared/entities/party-stage';
import { PrismaService } from '../../database/prisma-service';
import { PrismaGameSettingsMapper } from '../shared/prisma-game-settings.mapper';
import { PrismaPartyReadModelMapper } from './services/prisma-party-read-model-mapper';

interface PersistedPartyPlayerStageProgressEntry {
  readonly earnedPoints: number;
  readonly selectedActionId: PartyActionId;
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
  readonly status: PartyPlayerActionState['status'];
}

interface PersistedPartyPlayerProgress {
  readonly latestState: PartyPlayerActionState | null;
  readonly stageHistory: readonly PersistedPartyPlayerStageProgressEntry[];
}

@Injectable()
export class PrismaPlayerPartyActionRuntimeAdapter extends PlayerPartyActionRuntimePort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partyActionIdentifier: PartyActionIdentifier,
    private readonly partyStageIdentifier: PartyStageIdentifier,
    private readonly gameTypeParser: GameTypeParser,
    private readonly gameIdentifier: GameIdentifier,
    private readonly guestIdentifier: GuestIdentifier,
    private readonly partyReadModelMapper: PrismaPartyReadModelMapper,
    private readonly userIdentifier: UserIdentifier,
    private readonly gameSettingsMapper: PrismaGameSettingsMapper,
  ) {
    super();
  }

  async findSubmissionTarget(
    command: FindPartyActionSubmissionTargetCommand,
  ): ReturnType<PlayerPartyActionRuntimePort['findSubmissionTarget']> {
    const party = await this.prisma.party.findFirst({
      where: {
        id: command.partyId,
        deletedAt: null,
      },
      select: {
        id: true,
        gameId: true,
        status: true,
        context: true,
        game: {
          select: {
            ...this.gameSettingsMapper.select,
            type: true,
          },
        },
        scores: {
          where: {
            deletedAt: null,
            ...(command.playerIdentity.kind === PartyPlayerKind.USER
              ? { userId: command.playerIdentity.userId }
              : { guestId: command.playerIdentity.guestId }),
          },
          select: {
            context: true,
            guestId: true,
            userId: true,
          },
          take: 1,
        },
      },
    });

    const score = party?.scores[0];

    if (!party || !score) {
      return null;
    }

    const playerIdentity: PartyPlayerIdentity =
      score.userId !== null && score.userId !== undefined
        ? {
            kind: PartyPlayerKind.USER,
            userId: this.userIdentifier.parse(score.userId),
          }
        : {
            kind: PartyPlayerKind.GUEST,
            guestId: this.guestIdentifier.parse(String(score.guestId)),
          };

    return {
      context: this.partyReadModelMapper.toPartyRuntimeContext(party.context),
      gameId: this.gameIdentifier.parse(party.gameId),
      gameType: this.gameTypeParser.parse(party.game.type),
      partyId: command.partyId,
      playerActionState: this.partyReadModelMapper.toPartyPlayerActionState(score.context),
      playerIdentity,
      settings: this.gameSettingsMapper.toGameSettings(party.game),
      status: this.partyReadModelMapper.toPartyStatus(party.status),
    };
  }

  async saveSubmissionResult(command: SavePartyActionSubmissionResultCommand): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      if (command.context !== null || command.status !== undefined) {
        await transaction.party.update({
          where: {
            id: command.partyId,
          },
          data: {
            context: this.toPersistedContext(command.context),
            status: this.partyReadModelMapper.toPersistedPartyStatus(command.status),
          },
        });
      }

      const score = await transaction.score.findFirst({
        where: {
          partyId: command.partyId,
          ...(command.playerIdentity.kind === PartyPlayerKind.USER
            ? { userId: command.playerIdentity.userId }
            : { guestId: command.playerIdentity.guestId }),
          deletedAt: null,
        },
        select: {
          context: true,
          id: true,
          points: true,
        },
      });

      if (!score) {
        return;
      }

      const stageId = command.context?.lifecycle.stageId;
      const stagePosition = command.context?.lifecycle.stagePosition;

      if (
        stageId === null ||
        stageId === undefined ||
        stagePosition === null ||
        stagePosition === undefined
      ) {
        return;
      }

      const progress = this.toPersistedPartyPlayerProgress(score.context, score.points);
      const nextStageHistory = [
        ...progress.stageHistory.filter((entry) => entry.stageId !== stageId),
        {
          earnedPoints: command.scoreDelta,
          selectedActionId: command.actionId,
          stageId,
          stagePosition,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
      ].sort((left, right) => left.stagePosition - right.stagePosition);

      await transaction.score.update({
        where: {
          id: score.id,
        },
        data: {
          context: this.toPersistedScoreContext(nextStageHistory),
          points: nextStageHistory.reduce((total, entry) => total + entry.earnedPoints, 0),
        },
      });
    });
  }

  private toPersistedPartyPlayerProgress(
    value: unknown,
    totalPoints: number,
  ): PersistedPartyPlayerProgress {
    const latestState = this.partyReadModelMapper.toPartyPlayerActionState(value);
    const persistedHistory =
      value && typeof value === 'object' && !Array.isArray(value)
        ? this.toPersistedStageHistory(Reflect.get(value, 'stageHistory'))
        : [];

    if (persistedHistory.length > 0) {
      const latestHistoryEntry = persistedHistory[persistedHistory.length - 1] ?? null;

      return {
        latestState:
          latestHistoryEntry === null
            ? latestState
            : {
                earnedPoints: latestHistoryEntry.earnedPoints,
                selectedActionId: latestHistoryEntry.selectedActionId,
                stageId: latestHistoryEntry.stageId,
                stagePosition: latestHistoryEntry.stagePosition,
                status: latestHistoryEntry.status,
              },
        stageHistory: persistedHistory,
      };
    }

    if (latestState === null) {
      return {
        latestState: null,
        stageHistory: [],
      };
    }

    return {
      latestState,
      stageHistory: [
        {
          earnedPoints: totalPoints,
          selectedActionId: latestState.selectedActionId,
          stageId: latestState.stageId,
          stagePosition: latestState.stagePosition,
          status: latestState.status,
        },
      ],
    };
  }

  private toPersistedStageHistory(
    value: unknown,
  ): readonly PersistedPartyPlayerStageProgressEntry[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((entry) => this.toPersistedStageHistoryEntry(entry))
      .filter((entry): entry is PersistedPartyPlayerStageProgressEntry => entry !== null)
      .sort((left, right) => left.stagePosition - right.stagePosition);
  }

  private toPersistedStageHistoryEntry(
    value: unknown,
  ): PersistedPartyPlayerStageProgressEntry | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    const earnedPoints = Reflect.get(value, 'earnedPoints');
    const selectedActionId = Reflect.get(value, 'selectedActionId');
    const stageId = Reflect.get(value, 'stageId');
    const stagePosition = Reflect.get(value, 'stagePosition');
    const status = Reflect.get(value, 'status');

    if (!Number.isInteger(earnedPoints) || Number(earnedPoints) < 0) {
      return null;
    }

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
      earnedPoints: Number(earnedPoints),
      selectedActionId: normalizedSelectedActionId,
      stageId: normalizedStageId,
      stagePosition: Number(stagePosition),
      status,
    };
  }

  private toPersistedScoreContext(
    stageHistory: readonly PersistedPartyPlayerStageProgressEntry[],
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    const latestStage = stageHistory[stageHistory.length - 1];

    if (!latestStage) {
      return Prisma.JsonNull;
    }

    return {
      earnedPoints: latestStage.earnedPoints,
      selectedActionId: latestStage.selectedActionId,
      stageHistory: stageHistory.map((entry) => ({
        earnedPoints: entry.earnedPoints,
        selectedActionId: entry.selectedActionId,
        stageId: entry.stageId,
        stagePosition: entry.stagePosition,
        status: entry.status,
      })),
      stageId: latestStage.stageId,
      stagePosition: latestStage.stagePosition,
      status: latestStage.status,
    } satisfies Prisma.InputJsonValue;
  }

  private toPersistedContext(
    context: PartyRuntimeContext | null,
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (context === null) {
      return Prisma.JsonNull;
    }

    return {
      lifecycle: {
        phase: context.lifecycle.phase,
        stageEndsAtEpochMs: context.lifecycle.stageEndsAtEpochMs,
        stageRemainingDurationMs: context.lifecycle.stageRemainingDurationMs,
        stageId: context.lifecycle.stageId,
        stagePosition: context.lifecycle.stagePosition,
        stageTimeLimitSeconds: context.lifecycle.stageTimeLimitSeconds,
        totalStages: context.lifecycle.totalStages,
      },
    } satisfies Prisma.InputJsonValue;
  }
}
