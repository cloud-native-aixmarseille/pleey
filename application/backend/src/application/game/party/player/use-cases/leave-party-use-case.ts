import { Inject, Injectable } from '@nestjs/common';
import { BroadcastPartyObservationUseCase } from '../../shared/use-cases/broadcast-party-observation-use-case';
import type { LeavePartyDto } from '../dto/leave-party.dto';
import { PlayerPartyRuntimePort } from '../ports/player-party-runtime.port';

@Injectable()
export class LeavePartyUseCase {
  constructor(
    @Inject(PlayerPartyRuntimePort)
    private readonly playerPartyRuntime: PlayerPartyRuntimePort,
    private readonly broadcastPartyObservationUseCase: BroadcastPartyObservationUseCase,
  ) {}

  async execute(input: LeavePartyDto): Promise<boolean> {
    const party = await this.playerPartyRuntime.findPartyByPin(input.pin);

    if (!party) {
      return false;
    }

    const hasLeft = await this.playerPartyRuntime.removePlayer({
      partyId: party.partyId,
      playerIdentity: input.playerIdentity,
    });

    if (!hasLeft) {
      return false;
    }

    await this.broadcastPartyObservationUseCase.broadcastIfPresent({
      partyId: party.partyId,
    });

    return true;
  }
}
