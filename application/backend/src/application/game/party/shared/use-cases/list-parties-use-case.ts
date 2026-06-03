import { Inject, Injectable } from '@nestjs/common';
import type { PartySummary } from '../../../../../domain/game/party/shared/entities/party-summary';
import type { PaginatedResult } from '../../../../../domain/shared/value-objects/paginated-result';
import type { ListPartiesDto } from '../dto/list-parties.dto';
import { PartyManagementPort } from '../ports/party-management.port';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;

@Injectable()
export class ListPartiesUseCase {
  constructor(@Inject(PartyManagementPort) private readonly partyManagement: PartyManagementPort) {}

  async execute(input: ListPartiesDto): Promise<PaginatedResult<PartySummary>> {
    return this.partyManagement.listUserParties({
      ...input,
      page: Math.max(DEFAULT_PAGE, input.page ?? DEFAULT_PAGE),
      pageSize: Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE),
    });
  }
}
