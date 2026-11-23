import type { PartySettings } from '@pleey/domain/party';
import type { ThemeId } from '@pleey/domain/theme';

export class UpdateProjectDto {
  name!: string;
  description?: string;
  defaultPartySettings?: PartySettings | null;
  defaultThemeId?: ThemeId | null;
}
