import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PartySettingsType } from '../../../shared/graphql/types/party-settings-type';

@ObjectType()
export class ProjectType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => ID)
  organizationId!: string;

  @Field()
  createdAt!: Date;

  @Field(() => PartySettingsType, { nullable: true })
  defaultPartySettings!: PartySettingsType | null;
}
