import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OrganizationRole } from '@pleey/contracts/organization';
import { OrganizationMemberPermissionsType } from './organization-permissions-type';
import './organization-role-enum-type';

@ObjectType()
export class OrganizationMemberType {
  @Field(() => OrganizationMemberPermissionsType)
  permissions!: OrganizationMemberPermissionsType;

  @Field(() => [OrganizationRole])
  assignableRoles!: readonly OrganizationRole[];

  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organizationId!: string;

  @Field(() => ID)
  userId!: string;

  @Field()
  username!: string;

  @Field(() => OrganizationRole)
  role!: OrganizationRole;

  @Field()
  joinedAt!: Date;
}
