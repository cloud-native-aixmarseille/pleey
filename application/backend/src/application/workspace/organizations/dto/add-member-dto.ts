import { OrganizationRole } from '@pleey/domain/organization';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO for adding a member to an organization
 */
export class AddMemberDto {
  @IsString()
  @MinLength(1)
  @MaxLength(320)
  @IsNotEmpty()
  usernameOrEmail!: string;

  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role!: OrganizationRole;
}
