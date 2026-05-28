import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
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
      throw new Error(GameErrorCode.PARTY_NOT_FOUND);
    }

    if (party.hostUserId !== input.hostUserId) {
      throw new Error(GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN);
    }

    const hasRemovedPlayer = await this.hostPartyRuntimeControl.removePartyPlayer({
      partyId: input.partyId,
      playerIdentity: input.playerIdentity,
    });

    if (!hasRemovedPlayer) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    await this.broadcastPartyObservationUseCase.execute({ partyId: input.partyId });
  }
}
