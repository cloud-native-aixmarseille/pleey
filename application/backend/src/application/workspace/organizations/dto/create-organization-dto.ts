import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { PartySettings } from '../../../../domain/game/party/shared/entities/party-settings';

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
}
