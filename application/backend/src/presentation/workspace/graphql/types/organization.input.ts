import { Field, InputType, Int } from '@nestjs/graphql';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';

@InputType()
export class CreateOrganizationInput {
  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string;
}

@InputType()
export class AddOrganizationMemberInput {
  @Field(() => Int)
  userId!: number;

  @Field(() => OrganizationRole)
  role!: OrganizationRole;
}
