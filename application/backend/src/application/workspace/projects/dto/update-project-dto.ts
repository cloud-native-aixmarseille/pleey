import type { PartySettings } from '@pleey/contracts/party';
import type { ThemeId } from '@pleey/contracts/theme';

export class UpdateProjectDto {
  name!: string;
  description?: string;
  defaultPartySettings?: PartySettings | null;
  defaultThemeId?: ThemeId | null;
}
