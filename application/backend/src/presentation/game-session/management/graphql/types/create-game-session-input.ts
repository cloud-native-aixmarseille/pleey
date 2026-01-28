import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class CreateGameSessionInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  gameId!: number;
}
