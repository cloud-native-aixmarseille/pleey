import { inject, injectable } from 'inversify';
import {
  type PartyManagementPort,
  PartyManagementPortToken,
} from '../../../../../domains/game/party/host/ports/party-management.port';
import type { Party } from '../../../../../domains/game/party/shared/entities/party';

@injectable()
export class ListPartiesUseCase {
  constructor(
    @inject(PartyManagementPortToken)
    private readonly partyManagement: PartyManagementPort,
  ) {}

  execute(): Promise<readonly Party[]> {
    return this.partyManagement.listParties();
  }
}
