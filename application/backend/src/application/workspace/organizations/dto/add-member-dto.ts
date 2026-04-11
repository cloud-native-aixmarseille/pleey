import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import type { UserId } from '../../../../domain/identity/entities/user';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';

/**
 * DTO for adding a member to an organization
 */
export class AddMemberDto {
  @IsInt()
  @IsNotEmpty()
  userId: UserId;

  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role: OrganizationRole;
}
