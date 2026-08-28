import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PartySettingsType {
  @Field(() => Boolean)
  allowOptionChangeAfterVoting!: boolean;

  @Field(() => Boolean)
  randomizeOptionOrder!: boolean;

  @Field(() => Boolean)
  randomizeStageOrder!: boolean;
}
