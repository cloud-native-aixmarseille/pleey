import { inject, injectable } from 'inversify';
import {
  type CreatePartyCommand,
  type PartyManagementPort,
  PartyManagementPortToken,
} from '../../../../../domains/game/party/host/ports/party-management.port';
import type { Party } from '../../../../../domains/game/party/shared/entities/party';

@injectable()
export class CreatePartyUseCase {
  constructor(
    @inject(PartyManagementPortToken)
    private readonly partyManagement: PartyManagementPort,
  ) {}

  execute(command: CreatePartyCommand): Promise<Party> {
    return this.partyManagement.createParty(command);
  }
}
