import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class CreatePartyInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  gameId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(6)
  privatePartyPassword?: string;
}
