import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreatePartyInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  gameId!: string;
}
