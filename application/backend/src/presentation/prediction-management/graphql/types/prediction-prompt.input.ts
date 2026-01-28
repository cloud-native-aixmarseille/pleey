import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PredictionOptionInput {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field(() => String, { nullable: true })
  text?: string | null;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field(() => Boolean, { nullable: true })
  isCorrect?: boolean;
}

@InputType()
export class CreatePredictionPromptInput {
  @Field(() => Int)
  predictionId!: number;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field()
  promptText!: string;

  @Field(() => [PredictionOptionInput])
  options!: PredictionOptionInput[];

  @Field(() => Int, { nullable: true })
  timeLimit?: number;

  @Field(() => Int, { nullable: true })
  points?: number;
}

@InputType()
export class UpdatePredictionPromptInput {
  @Field(() => Int, { nullable: true })
  predictionId?: number;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field(() => String, { nullable: true })
  promptText?: string;

  @Field(() => [PredictionOptionInput], { nullable: true })
  options?: PredictionOptionInput[];

  @Field(() => Int, { nullable: true })
  timeLimit?: number;

  @Field(() => Int, { nullable: true })
  points?: number;
}
