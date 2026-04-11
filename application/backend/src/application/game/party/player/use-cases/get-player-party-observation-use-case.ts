import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
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
    const observation = await this.playerPartyObservationReader.findPlayerObservationByPartyId(
      input.partyId,
    );

    if (!observation) {
      throw new Error(GameErrorCode.PARTY_NOT_FOUND);
    }

    return observation;
  }
}
