import { Inject, Injectable } from '@nestjs/common';
import type { PartySummary } from '../../../../../domain/game/party/shared/entities/party-summary';
import type { ListPartiesDto } from '../dto/list-parties.dto';
import { PartyManagementPort } from '../ports/party-management.port';

@Injectable()
export class ListPartiesUseCase {
  constructor(@Inject(PartyManagementPort) private readonly partyManagement: PartyManagementPort) {}

  async execute(input: ListPartiesDto): Promise<readonly PartySummary[]> {
    return this.partyManagement.listUserParties(input);
  }
}
