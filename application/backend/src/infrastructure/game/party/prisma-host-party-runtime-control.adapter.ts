import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type HostControlledPartyRuntime,
  HostPartyRuntimeControlPort,
  type RemoveHostPartyPlayerCommand,
  type SaveHostPartyRuntimeCommand,
} from '../../../application/game/party/host/ports/host-party-runtime-control.port';
import { PartyActionIdentifier } from '../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyStageIdentifier } from '../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { GameIdentifier } from '../../../application/game/shared/services/identifiers/game-identifier';
import { PartyStageCatalogPort } from '../../../application/game/types/shared/ports/party-stage-catalog.port';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import type { PartyId } from '../../../domain/game/party/shared/entities/party';
import type { PartyActionId } from '../../../domain/game/party/shared/entities/party-action';
import type { PartyStageId } from '../../../domain/game/party/shared/entities/party-stage';
import { PartyRuntimeContextProjectionService } from '../../../domain/game/party/shared/services/party-runtime-context-projection.service';
import { PrismaService } from '../../database/prisma-service';
import { PrismaGameSettingsMapper } from '../shared/prisma-game-settings.mapper';
import { PrismaPartyPlayerRemovalService } from './services/prisma-party-player-removal.service';
import { PrismaPartyReadModelMapper } from './services/prisma-party-read-model-mapper';

interface PersistedPartyPlayerStageProgressEntry {
  readonly earnedPoints: number;
  readonly selectedActionId: PartyActionId;
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
  readonly status: string;
}

@Injectable()
export class PrismaHostPartyRuntimeControlAdapter extends HostPartyRuntimeControlPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partyActionIdentifier: PartyActionIdentifier,
    private readonly gameIdentifier: GameIdentifier,
    private readonly partyIdentifier: PartyIdentifier,
    private readonly partyStageIdentifier: PartyStageIdentifier,
    private readonly partyStageCatalog: PartyStageCatalogPort,
    private readonly partyPlayerRemovalService: PrismaPartyPlayerRemovalService,
    private readonly partyReadModelMapper: PrismaPartyReadModelMapper,
    private readonly runtimeContextProjection: PartyRuntimeContextProjectionService,
    private readonly userIdentifier: UserIdentifier,
    private readonly gameSettingsMapper: PrismaGameSettingsMapper,
  ) {
    super();
  }

  async findPartyRuntimeByPartyId(partyId: PartyId): Promise<HostControlledPartyRuntime | null> {
    const party = await this.prisma.party.findFirst({
      where: {
        id: partyId,
        deletedAt: null,
      },
      select: {
        id: true,
        gameId: true,
        hostId: true,
        game: {
          select: this.gameSettingsMapper.select,
        },
        status: true,
        context: true,
        scores: {
          where: {
            deletedAt: null,
          },
          select: {
            context: true,
            createdAt: true,
            points: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: {
                  select: {
                    updatedAt: true,
                  },
                },
              },
            },
            guest: {
              select: {
                id: true,
                username: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!party) {
      return null;
    }

    const normalizedScores = this.partyReadModelMapper.normalizePlayerScores(party.scores);
    const excludedUserId = this.userIdentifier.parse(party.hostId);
    const players = this.partyReadModelMapper.collectPlayers(normalizedScores, {
      excludedUserId,
      resolveGuestJoinedAt: (score) => score.guest?.createdAt ?? score.createdAt,
    });
    const playerActionStates = this.partyReadModelMapper.collectPlayerActionStates(
      normalizedScores,
      {
        excludedUserId,
      },
    );
    const baseContext = this.partyReadModelMapper.toPartyRuntimeContext(party.context);
    const stageId = baseContext?.lifecycle.stageId;
    const stage =
      stageId === null || stageId === undefined
        ? null
        : await this.partyStageCatalog.findStageById(
            this.gameIdentifier.parse(party.gameId),
            stageId,
            {
              partyId: this.partyIdentifier.parse(party.id),
              settings: this.gameSettingsMapper.toGameSettings(party.game),
            },
          );
    const submittedPlayerCount = playerActionStates.filter(
      (entry) => entry.state.stageId === stageId,
    ).length;

    return {
      context: this.runtimeContextProjection.project({
        baseContext,
        playerActionStates: playerActionStates.map((entry) => entry.state),
        stage,
        submittedPlayerCount,
        totalEligiblePlayerCount: players.length,
      }),
      gameId: this.gameIdentifier.parse(party.gameId),
      hostUserId: this.userIdentifier.parse(party.hostId),
      partyId: this.partyIdentifier.parse(party.id),
      settings: this.gameSettingsMapper.toGameSettings(party.game),
      status: this.partyReadModelMapper.toPartyStatus(party.status, {
        unknownStatus: 'validation-error',
      }),
    };
  }

  async savePartyRuntime(command: SaveHostPartyRuntimeCommand): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.party.update({
        where: {
          id: command.partyId,
        },
        data: {
          context: this.toPersistedContext(command.context),
          status: this.partyReadModelMapper.toPersistedPartyStatus(command.status),
        },
      });

      if (command.resetPlayerProgress === undefined) {
        return;
      }

      await this.resetPlayerProgress(transaction, command.partyId, command.resetPlayerProgress);
    });
  }

  removePartyPlayer(command: RemoveHostPartyPlayerCommand): Promise<boolean> {
    return this.partyPlayerRemovalService.removePlayer(command);
  }

  private async resetPlayerProgress(
    transaction: Prisma.TransactionClient,
    partyId: SaveHostPartyRuntimeCommand['partyId'],
    resetPlayerProgress: NonNullable<SaveHostPartyRuntimeCommand['resetPlayerProgress']>,
  ): Promise<void> {
    const scores = await transaction.score.findMany({
      where: {
        deletedAt: null,
        partyId,
      },
      select: {
        context: true,
        id: true,
        points: true,
      },
    });

    await Promise.all(
      scores.map(async (score) => {
        const resetFromStagePosition =
          await this.resolveResetFromStagePosition(resetPlayerProgress);
        const stageHistory = this.toPersistedStageHistory(score.context, score.points).filter(
          (entry) =>
            resetFromStagePosition !== null && entry.stagePosition < resetFromStagePosition,
        );

        await transaction.score.update({
          where: {
            id: score.id,
          },
          data: {
            context: this.toPersistedScoreContext(stageHistory),
            points: stageHistory.reduce((total, entry) => total + entry.earnedPoints, 0),
          },
        });
      }),
    );
  }

  private async resolveResetFromStagePosition(
    resetPlayerProgress: NonNullable<SaveHostPartyRuntimeCommand['resetPlayerProgress']>,
  ): Promise<number | null> {
    if (resetPlayerProgress.fromStageId === null) {
      return null;
    }

    const stage = await this.partyStageCatalog.findStageById(
      resetPlayerProgress.gameId,
      resetPlayerProgress.fromStageId,
      {
        partyId: resetPlayerProgress.partyId,
        settings: resetPlayerProgress.settings,
      },
    );

    if (!stage) {
      throw new Error(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE);
    }

    return stage.stagePosition;
  }

  private toPersistedStageHistory(
    value: unknown,
    totalPoints: number,
  ): readonly PersistedPartyPlayerStageProgressEntry[] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [];
    }

    const stageHistoryValue = Reflect.get(value, 'stageHistory');

    if (Array.isArray(stageHistoryValue)) {
      const stageHistory = stageHistoryValue
        .map((entry) => this.toPersistedStageHistoryEntry(entry))
        .filter((entry): entry is PersistedPartyPlayerStageProgressEntry => entry !== null)
        .sort((left, right) => left.stagePosition - right.stagePosition);

      if (stageHistory.length > 0) {
        return stageHistory;
      }
    }

    const latestState = this.partyReadModelMapper.toPartyPlayerActionState(value);

    if (latestState === null) {
      return [];
    }

    return [
      {
        earnedPoints: totalPoints,
        selectedActionId: latestState.selectedActionId,
        stageId: latestState.stageId,
        stagePosition: latestState.stagePosition,
        status: latestState.status,
      },
    ];
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

    if (typeof status !== 'string' || status.length === 0) {
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
    command: SaveHostPartyRuntimeCommand['context'],
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (command === null) {
      return Prisma.JsonNull;
    }

    return {
      lifecycle: {
        phase: command.lifecycle.phase,
        stageEndsAtEpochMs: command.lifecycle.stageEndsAtEpochMs,
        stageRemainingDurationMs: command.lifecycle.stageRemainingDurationMs,
        stageId: command.lifecycle.stageId,
        stagePosition: command.lifecycle.stagePosition,
        stageTimeLimitSeconds: command.lifecycle.stageTimeLimitSeconds,
        totalStages: command.lifecycle.totalStages,
      },
      ...(command.stage
        ? {
            stage: {
              actionSubmission: command.stage.actionSubmission
                ? {
                    currentPlayer: command.stage.actionSubmission.currentPlayer
                      ? {
                          selectedActionId:
                            command.stage.actionSubmission.currentPlayer.selectedActionId,
                          status: command.stage.actionSubmission.currentPlayer.status,
                        }
                      : null,
                    submittedPlayerCount: command.stage.actionSubmission.submittedPlayerCount,
                    totalEligiblePlayerCount:
                      command.stage.actionSubmission.totalEligiblePlayerCount,
                  }
                : null,
              current: command.stage.current
                ? {
                    actions: command.stage.current.actions.map((action) => ({
                      id: action.id,
                      text: action.text,
                    })),
                    text: command.stage.current.text,
                  }
                : null,
            },
          }
        : {}),
      ...(command.result
        ? {
            result: {
              current: command.result.current
                ? {
                    actions: command.result.current.actions.map((action) => ({
                      actionCount: action.actionCount,
                      actionPercent: action.actionPercent,
                      earnedPoints: action.earnedPoints,
                      id: action.id,
                      isCorrect: action.isCorrect,
                      text: action.text,
                    })),
                    text: command.result.current.text,
                  }
                : null,
              currentPlayer: command.result.currentPlayer
                ? {
                    earnedPoints: command.result.currentPlayer.earnedPoints,
                    isCorrect: command.result.currentPlayer.isCorrect,
                    selectedActionId: command.result.currentPlayer.selectedActionId,
                  }
                : null,
            },
          }
        : {}),
    } satisfies Prisma.InputJsonValue;
  }
}
