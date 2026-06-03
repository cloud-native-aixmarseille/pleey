import { Field, Int, ObjectType } from '@nestjs/graphql';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import './organization-role-enum-type';

@ObjectType()
export class OrganizationMemberType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  organizationId!: number;

  @Field(() => Int)
  userId!: number;

  @Field()
  username!: string;

  @Field(() => OrganizationRole)
  role!: OrganizationRole;

  @Field()
  joinedAt!: Date;
}
