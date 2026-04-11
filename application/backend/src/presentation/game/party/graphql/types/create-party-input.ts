import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class CreatePartyInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  gameId!: number;
}
