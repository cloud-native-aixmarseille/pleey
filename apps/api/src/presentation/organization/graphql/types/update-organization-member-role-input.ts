import { Field, InputType } from '@nestjs/graphql';
import { OrganizationRole } from '@pleey/contracts/organization';
import { IsEnum } from 'class-validator';
import './organization-role-enum-type';

@InputType()
export class UpdateOrganizationMemberRoleInput {
  @Field(() => OrganizationRole)
  @IsEnum(OrganizationRole)
  role!: OrganizationRole;
}
