import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import { PasswordService } from '../../../../../domain/identity/services/password-service';
import { BroadcastPartyObservationUseCase } from '../../shared/use-cases/broadcast-party-observation-use-case';
import type { JoinPartyDto } from '../dto/join-party.dto';
import type { JoinPartyResultDto } from '../dto/join-party-result.dto';
import { PlayerPartyRuntimePort } from '../ports/player-party-runtime.port';

@Injectable()
export class JoinPartyUseCase {
  constructor(
    @Inject(PlayerPartyRuntimePort)
    private readonly playerPartyRuntime: PlayerPartyRuntimePort,
    private readonly broadcastPartyObservationUseCase: BroadcastPartyObservationUseCase,
    @Inject(PasswordService)
    private readonly passwordService: Pick<PasswordService, 'compare'>,
  ) {}

  async execute(input: JoinPartyDto): Promise<JoinPartyResultDto> {
    const party = await this.playerPartyRuntime.findPartyByPin(input.pin);
    const avatarSeed = input.avatarSeed?.trim() || undefined;

    if (!party) {
      throw new Error(GameErrorCode.PARTY_NOT_FOUND);
    }

    if (party.privatePartyPasswordHash) {
      const password = input.partyPassword?.trim() ?? '';

      if (password.length === 0) {
        throw new Error(GameErrorCode.VALIDATION_FAILED);
      }

      const isPasswordValid = await this.passwordService.compare(
        password,
        party.privatePartyPasswordHash,
      );

      if (!isPasswordValid) {
        throw new Error(GameErrorCode.VALIDATION_FAILED);
      }
    }

    const persistedPlayerIdentity = this.resolvePersistedPlayerIdentity(input);
    const existingPlayer = persistedPlayerIdentity
      ? await this.playerPartyRuntime.findPartyPlayer({
          partyId: party.partyId,
          playerIdentity: persistedPlayerIdentity,
        })
      : null;

    if (party.status !== PartyStatus.WAITING && !existingPlayer) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    if (input.playerIdentity.kind === PartyPlayerKind.USER) {
      const activeParty = await this.playerPartyRuntime.findActivePartyByUserId(
        input.playerIdentity.userId,
      );

      if (activeParty && activeParty.partyId !== party.partyId) {
        throw new Error(GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY);
      }

      await this.playerPartyRuntime.ensureAuthenticatedPlayer({
        partyId: party.partyId,
        userId: input.playerIdentity.userId,
      });

      return this.resolveJoinedPlayer({
        party,
        playerCommand: { partyId: party.partyId, playerIdentity: input.playerIdentity },
      });
    }

    const username = input.username.trim();
    const isPersistedGuestRejoin = input.playerIdentity.guestId !== undefined;

    if (isPersistedGuestRejoin && !existingPlayer) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    if (!isPersistedGuestRejoin && username.length === 0) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    const guestPlayer = await this.playerPartyRuntime.ensureGuestPlayer({
      ...(avatarSeed ? { avatarSeed } : {}),
      partyId: party.partyId,
      guestId: input.playerIdentity.guestId ?? null,
      username,
    });

    return this.resolveJoinedPlayer({
      party,
      playerCommand: { partyId: party.partyId, playerIdentity: guestPlayer },
    });
  }

  private async resolveJoinedPlayer({
    party,
    playerCommand,
  }: {
    readonly party: Awaited<ReturnType<PlayerPartyRuntimePort['findPartyByPin']>>;
    readonly playerCommand: Parameters<PlayerPartyRuntimePort['findPartyPlayer']>[0];
  }): Promise<JoinPartyResultDto> {
    if (!party) {
      throw new Error(GameErrorCode.PARTY_NOT_FOUND);
    }

    const player = await this.playerPartyRuntime.findPartyPlayer(playerCommand);

    if (!player) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    await this.broadcastPartyObservationUseCase.execute({ partyId: party.partyId });

    return {
      gameId: party.gameId,
      player,
      partyId: party.partyId,
      pin: party.pin,
    };
  }

  private resolvePersistedPlayerIdentity(input: JoinPartyDto): PartyPlayerIdentity | null {
    if (input.playerIdentity.kind === PartyPlayerKind.USER) {
      return input.playerIdentity;
    }

    if (input.playerIdentity.guestId === undefined) {
      return null;
    }

    return {
      kind: PartyPlayerKind.GUEST,
      guestId: input.playerIdentity.guestId,
    };
  }
}
