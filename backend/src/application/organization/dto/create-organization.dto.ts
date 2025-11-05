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
}
