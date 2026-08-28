import { Injectable } from '@nestjs/common';
import { PlayerPartyObservationReaderPort } from '../../../application/game/party/player/ports/player-party-observation-reader.port';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../../application/game/shared/services/identifiers/game-identifier';
import { PartyStageCatalogPort } from '../../../application/game/types/shared/ports/party-stage-catalog.port';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import type { PlayerPartyObservation } from '../../../domain/game/party/player/entities/player-party-observation';
import type { PartyId } from '../../../domain/game/party/shared/entities/party';
import { PartyRuntimeContextProjectionService } from '../../../domain/game/party/shared/services/party-runtime-context-projection.service';
import { createDomainError } from '../../../domain/shared/errors/domain-error';
import { PrismaService } from '../../database/prisma-service';
import { PrismaPartySettingsMapper } from '../shared/prisma-party-settings.mapper';
import { PrismaPartyReadModelMapper } from './services/prisma-party-read-model-mapper';

const PLAYER_PARTY_OBSERVATION_PARTY_REQUIRED_ERROR = {
  code: 'PLAYER_PARTY_OBSERVATION_PARTY_REQUIRED',
  messageKey: 'PLAYER_PARTY_OBSERVATION_PARTY_REQUIRED',
} as const;

@Injectable()
export class PrismaPlayerPartyObservationReader implements PlayerPartyObservationReaderPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partyIdentifier: PartyIdentifier,
    private readonly partyPinIdentifier: PartyPinIdentifier,
    private readonly gameIdentifier: GameIdentifier,
    private readonly partyStageCatalog: PartyStageCatalogPort,
    private readonly partyReadModelMapper: PrismaPartyReadModelMapper,
    private readonly runtimeContextProjection: PartyRuntimeContextProjectionService,
    private readonly userIdentifier: UserIdentifier,
    private readonly partySettingsMapper: PrismaPartySettingsMapper,
  ) {}

  async findPlayerObservationByPartyId(partyId: PartyId): Promise<PlayerPartyObservation | null> {
    const party = await this.loadPlayerObservationSource(partyId);

    return party ? this.toPlayerObservation(party, partyId) : null;
  }

  private loadPlayerObservationSource(partyId: PartyId) {
    return this.prisma.party.findFirst({
      where: {
        id: partyId,
        deletedAt: null,
      },
      select: {
        id: true,
        gameId: true,
        settings: true,
        game: {
          select: {
            type: true,
          },
        },
        pin: true,
        status: true,
        context: true,
        host: {
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
        scores: {
          where: {
            deletedAt: null,
          },
          select: {
            createdAt: true,
            context: true,
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
  }

  private async toPlayerObservation(
    party: Awaited<ReturnType<PrismaPlayerPartyObservationReader['loadPlayerObservationSource']>>,
    partyId: PartyId,
  ): Promise<PlayerPartyObservation> {
    if (!party) {
      throw createDomainError(PLAYER_PARTY_OBSERVATION_PARTY_REQUIRED_ERROR, { partyId });
    }

    const excludedUserId = this.userIdentifier.parse(party.host.id);
    const normalizedScores = this.partyReadModelMapper.normalizePlayerScores(party.scores);
    const players = this.partyReadModelMapper.collectPlayers(normalizedScores, {
      excludedUserId,
      resolveGuestJoinedAt: (score) => score.guest?.createdAt ?? score.createdAt,
    });
    const playerActionStates = this.partyReadModelMapper.collectPlayerActionStates(normalizedScores, {
      excludedUserId,
    });
    const baseContext = this.partyReadModelMapper.toPartyRuntimeContext(party.context);
    const stageId = baseContext?.lifecycle.stageId;
    const stage =
      stageId === null || stageId === undefined
        ? null
        : await this.partyStageCatalog.findStageById(this.gameIdentifier.parse(party.gameId), stageId, {
            partyId: this.partyIdentifier.parse(party.id),
            settings: this.partySettingsMapper.toPartySettings(party.settings),
          });
    const submittedPlayerCount = playerActionStates.filter((entry) => entry.state.stageId === stageId).length;

    return {
      partyId: this.partyIdentifier.parse(party.id),
      pin: this.partyPinIdentifier.parse(party.pin),
      status: this.partyReadModelMapper.toPartyStatus(party.status),
      context: this.runtimeContextProjection.project({
        baseContext,
        playerActionStates: playerActionStates.map((entry) => entry.state),
        stage,
        submittedPlayerCount,
        totalEligiblePlayerCount: players.length,
      }),
      host: {
        avatarUri: this.partyReadModelMapper.toUserAvatarUri(
          this.userIdentifier.parse(party.host.id),
          party.host.avatar?.updatedAt ?? null,
        ),
        username: party.host.username,
      },
      playerActionStates,
      players: players.map((player) => this.partyReadModelMapper.toPlayerObservationPlayer(player)),
    };
  }
}
