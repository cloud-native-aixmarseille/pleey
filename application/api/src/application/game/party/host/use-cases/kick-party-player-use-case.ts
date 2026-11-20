import { Inject, Injectable } from '@nestjs/common';
import {
  HostPartyControlForbiddenError,
  PartyCommandNotAvailableError,
  PartyNotFoundError,
} from '../../../../../domain/game/errors';
import { BroadcastPartyObservationUseCase } from '../../shared/use-cases/broadcast-party-observation-use-case';
import type { HostPartyPlayerControlDto } from '../dto/host-party-player-control.dto';
import { HostPartyRuntimeControlPort } from '../ports/host-party-runtime-control.port';

@Injectable()
export class KickPartyPlayerUseCase {
  constructor(
    @Inject(HostPartyRuntimeControlPort)
    private readonly hostPartyRuntimeControl: HostPartyRuntimeControlPort,
    private readonly broadcastPartyObservationUseCase: BroadcastPartyObservationUseCase,
  ) {}

  async execute(input: HostPartyPlayerControlDto): Promise<void> {
    const party = await this.hostPartyRuntimeControl.findPartyRuntimeByPartyId(input.partyId);

    if (!party) {
      throw new PartyNotFoundError({
        hostUserId: input.hostUserId,
        partyId: input.partyId,
        playerIdentity: input.playerIdentity,
      });
    }

    if (party.hostUserId !== input.hostUserId) {
      throw new HostPartyControlForbiddenError({
        actualHostUserId: party.hostUserId,
        hostUserId: input.hostUserId,
        partyId: input.partyId,
        playerIdentity: input.playerIdentity,
      });
    }

    const hasRemovedPlayer = await this.hostPartyRuntimeControl.removePartyPlayer({
      partyId: input.partyId,
      playerIdentity: input.playerIdentity,
    });

    if (!hasRemovedPlayer) {
      throw new PartyCommandNotAvailableError({
        hostUserId: input.hostUserId,
        partyId: input.partyId,
        playerIdentity: input.playerIdentity,
        reason: 'playerNotPresent',
      });
    }

    await this.broadcastPartyObservationUseCase.execute({ partyId: input.partyId });
  }
}
