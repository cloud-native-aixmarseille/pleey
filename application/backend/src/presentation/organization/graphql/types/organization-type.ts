import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import './organization-role-enum-type';

@ObjectType()
export class OrganizationType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => OrganizationRole, { nullable: true })
  role?: OrganizationRole | null;
}
