import type { PartySettings } from '../../../../domain/game/party/shared/entities/party-settings';
import type { ThemeId } from '../../../../domain/theme/entities/theme-id';

export class UpdateOrganizationDto {
  name!: string;
  description?: string;
  defaultPartySettings?: PartySettings | null;
  defaultThemeId?: ThemeId | null;
}
