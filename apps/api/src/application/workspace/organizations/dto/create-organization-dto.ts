import type { PartySettings } from '@pleey/contracts/party';
import type { ThemeId } from '@pleey/contracts/theme';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
