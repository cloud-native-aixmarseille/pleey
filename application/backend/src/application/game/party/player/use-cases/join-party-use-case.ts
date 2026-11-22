import { Inject, Injectable } from '@nestjs/common';
import { PartyStatus } from '@pleey/contracts/party';
import {
  PartyCommandNotAvailableError,
  PartyNotFoundError,
  PlayerAlreadyInActivePartyError,
} from '../../../../../domain/game/errors';
import {
  InvalidPartyPasswordError,
  JoinedPartyPlayerNotFoundError,
  MissingPartyPasswordError,
} from '../../../../../domain/game/party/errors/join-party.error';
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

    if (!party) {
      throw new PartyNotFoundError({ requestedPin: input.pin });
    }

    const existingPlayer = await this.playerPartyRuntime.findPartyPlayer({
      partyId: party.partyId,
      playerIdentity: input.playerIdentity,
    });

    if (party.privatePartyPasswordHash && !existingPlayer) {
      const password = input.partyPassword?.trim() ?? '';
      if (password.length === 0) throw new MissingPartyPasswordError({ partyId: party.partyId });
      if (!(await this.passwordService.compare(password, party.privatePartyPasswordHash))) {
        throw new InvalidPartyPasswordError({ partyId: party.partyId });
      }
    }

    const isNewPlayerBlockedFromActiveParty =
      party.status !== PartyStatus.WAITING && !existingPlayer && !party.settings.allowJoiningAfterStart;

    if (isNewPlayerBlockedFromActiveParty) {
      throw new PartyCommandNotAvailableError({
        isRejoin: existingPlayer !== null,
        partyId: party.partyId,
        partyStatus: party.status,
      });
    }

    const activeParty = await this.playerPartyRuntime.findActivePartyByUserId(input.playerIdentity.userId);
    if (activeParty && activeParty.partyId !== party.partyId) {
      throw new PlayerAlreadyInActivePartyError({
        activePartyId: activeParty.partyId,
        requestedPartyId: party.partyId,
        userId: input.playerIdentity.userId,
      });
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

  private async resolveJoinedPlayer({
    party,
    playerCommand,
  }: {
    readonly party: Awaited<ReturnType<PlayerPartyRuntimePort['findPartyByPin']>>;
    readonly playerCommand: Parameters<PlayerPartyRuntimePort['findPartyPlayer']>[0];
  }): Promise<JoinPartyResultDto> {
    if (!party) {
      throw new PartyNotFoundError({ requestedPartyId: playerCommand.partyId });
    }

    const player = await this.playerPartyRuntime.findPartyPlayer(playerCommand);

    if (!player) {
      throw new JoinedPartyPlayerNotFoundError({
        partyId: playerCommand.partyId,
        playerIdentity: playerCommand.playerIdentity,
      });
    }

    await this.broadcastPartyObservationUseCase.execute({ partyId: party.partyId });

    return {
      gameId: party.gameId,
      player,
      partyId: party.partyId,
      pin: party.pin,
    };
  }
}
