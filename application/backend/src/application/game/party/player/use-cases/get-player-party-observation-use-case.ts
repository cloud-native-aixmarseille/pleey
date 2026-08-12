import { Inject, Injectable } from '@nestjs/common';
import { PartyNotFoundError } from '../../../../../domain/game/errors';
import type { PlayerPartyObservation } from '../../../../../domain/game/party/player/entities/player-party-observation';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import { PlayerPartyObservationReaderPort } from '../ports/player-party-observation-reader.port';

@Injectable()
export class GetPlayerPartyObservationUseCase {
  constructor(
    @Inject(PlayerPartyObservationReaderPort)
    private readonly playerPartyObservationReader: PlayerPartyObservationReaderPort,
  ) {}

  async execute(input: { partyId: PartyId }): Promise<PlayerPartyObservation> {
    const observation = await this.playerPartyObservationReader.findPlayerObservationByPartyId(input.partyId);

    if (!observation) {
      throw new PartyNotFoundError({ partyId: input.partyId });
    }

    return observation;
  }
}
