import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';

/**
 * DTO for adding a member to an organization
 */
export class AddMemberDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role: OrganizationRole;
}
