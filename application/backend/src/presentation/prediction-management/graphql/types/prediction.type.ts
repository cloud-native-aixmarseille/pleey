import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GameType } from '../../../../domain/game/enums/game-type.enum';

registerEnumType(GameType, {
  name: 'GameType',
});

@ObjectType()
export class PredictionGameType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  predictionId!: number;

  @Field(() => GameType)
  type!: GameType;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => Int)
  projectId!: number;

  @Field()
  createdAt!: Date;

  @Field(() => Int)
  promptCount!: number;
}

@ObjectType()
class PredictionOptionType {
  @Field(() => Int)
  id!: number;

  @Field(() => String, { nullable: true })
  text!: string | null;

  @Field(() => Int)
  position!: number;

  @Field()
  isCorrect!: boolean;
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

  @Field(() => [PredictionOptionType])
  options!: PredictionOptionType[];

  @Field(() => Int)
  timeLimit!: number;

  @Field(() => Int)
  points!: number;
}
