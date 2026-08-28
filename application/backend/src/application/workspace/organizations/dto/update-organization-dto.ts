import type { PartySettings } from '../../../../domain/game/party/shared/entities/party-settings';

export class UpdateOrganizationDto {
  name!: string;
  description?: string;
  defaultPartySettings?: PartySettings | null;
}
