import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { PartySettings } from '../../../../domain/game/party/shared/entities/party-settings';
import type { ThemeId } from '../../../../domain/theme/entities/theme-id';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  defaultPartySettings?: PartySettings | null;

  @IsOptional()
  defaultThemeId?: ThemeId | null;
}
