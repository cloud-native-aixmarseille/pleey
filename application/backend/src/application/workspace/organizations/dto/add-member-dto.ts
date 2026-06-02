import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';

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
