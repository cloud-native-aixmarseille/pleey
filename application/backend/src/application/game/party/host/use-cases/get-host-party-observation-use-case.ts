import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import { HostPartyObservationReaderPort } from '../ports/host-party-observation-reader.port';

@Injectable()
export class GetHostPartyObservationUseCase {
  constructor(
    @Inject(HostPartyObservationReaderPort)
    private readonly hostPartyObservationReader: HostPartyObservationReaderPort,
  ) {}

  async execute(input: { partyId: PartyId }): Promise<HostPartyObservation> {
    const observation = await this.hostPartyObservationReader.findHostObservationByPartyId(
      input.partyId,
    );

    if (!observation) {
      throw new Error(GameErrorCode.PARTY_NOT_FOUND);
    }

    return observation;
  }
}
