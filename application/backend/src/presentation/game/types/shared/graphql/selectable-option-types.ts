import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

@ObjectType()
export class SelectableOptionType {
  @Field(() => Int, { nullable: true })
  id!: number | null;

  @Field(() => String, { nullable: true })
  text!: string | null;

  @Field(() => Int)
  position!: number;

  @Field()
  isCorrect!: boolean;
}

@InputType()
export class SelectableOptionInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

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
