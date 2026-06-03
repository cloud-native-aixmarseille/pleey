import { Field, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import './organization-role-enum-type';

@InputType()
export class UpdateOrganizationMemberRoleInput {
  @Field(() => OrganizationRole)
  @IsEnum(OrganizationRole)
  role!: OrganizationRole;
}
