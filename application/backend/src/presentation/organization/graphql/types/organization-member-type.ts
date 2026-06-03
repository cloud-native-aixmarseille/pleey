import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import './organization-role-enum-type';

@ObjectType()
export class OrganizationMemberType {
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
