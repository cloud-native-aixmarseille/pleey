import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

@ObjectType()
export class SelectableOptionType {
  @Field(() => ID, { nullable: true })
  id!: string | null;

  @Field(() => String, { nullable: true })
  text!: string | null;

  @Field(() => Int)
  position!: number;

  @Field()
  isCorrect!: boolean;
}

@InputType()
export class SelectableOptionInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  text?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
