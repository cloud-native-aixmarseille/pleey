import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { SelectableOptionType } from '../../../shared/graphql/selectable-option-types';

@ObjectType()
export class PredictionType {
  @Field(() => ID)
  predictionId!: string;

  @Field(() => ID)
  gameId!: string;

  @Field()
  type!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  createdAt!: Date;

  @Field(() => Int)
  promptCount!: number;

  @Field(() => Boolean)
  allowOptionChangeAfterVoting!: boolean;

  @Field(() => Boolean)
  randomizeStageOrder!: boolean;

  @Field(() => Boolean)
  randomizeOptionOrder!: boolean;
}

@ObjectType()
export class PredictionPromptType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  predictionId!: string;

  @Field(() => Int)
  position!: number;

  @Field()
  promptText!: string;

  @Field(() => Int)
  timeLimit!: number;

  @Field(() => Int)
  points!: number;

  @Field(() => [SelectableOptionType])
  options!: SelectableOptionType[];
}
