import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { PartySettingsType } from '../../../shared/graphql/types/party-settings-type';
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

  @Field(() => PartySettingsType, { nullable: true })
  defaultPartySettings!: PartySettingsType | null;

  @Field(() => OrganizationRole, { nullable: true })
  role?: OrganizationRole | null;
}
