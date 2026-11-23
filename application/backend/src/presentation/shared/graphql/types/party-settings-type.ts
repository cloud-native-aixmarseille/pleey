import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PartySettingsType {
  @Field(() => Int)
  questionReadingTimeSeconds!: number;

  @Field(() => Boolean)
  allowJoiningAfterStart!: boolean;

  @Field(() => Boolean)
  allowOptionChangeAfterVoting!: boolean;

  @Field(() => Boolean)
  randomizeOptionOrder!: boolean;

  @Field(() => Boolean)
  randomizeStageOrder!: boolean;
}
