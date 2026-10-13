import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { PartySettings } from '../../../../domain/game/party/shared/entities/party-settings';
import type { ThemeId } from '../../../../domain/theme/entities/theme-id';

/**
 * DTO for creating a new organization
 */
export class CreateOrganizationDto {
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
