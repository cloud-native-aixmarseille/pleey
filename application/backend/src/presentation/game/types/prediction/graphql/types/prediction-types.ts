import { Field, Int, ObjectType } from '@nestjs/graphql';
import { SelectableOptionType } from '../../../shared/graphql/selectable-option-types';

@ObjectType()
export class PredictionType {
  @Field(() => Int)
  predictionId!: number;

  @Field(() => Int)
  gameId!: number;

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
}

@ObjectType()
export class PredictionPromptType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  predictionId!: number;

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
