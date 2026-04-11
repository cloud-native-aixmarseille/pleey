import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { SelectableOptionInput } from '../../../shared/graphql/selectable-option-types';

@InputType()
export class CreatePredictionInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  projectId!: number;

  @Field()
  @IsString()
  @MaxLength(160)
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;
}

@InputType()
export class UpdatePredictionInput {
  @Field()
  @IsString()
  @MaxLength(160)
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;
}

@InputType()
export class CreatePredictionPromptInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  predictionId!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @Field()
  @IsString()
  @MaxLength(500)
  promptText!: string;

  @Field(() => Int)
  @IsInt()
  @Min(5)
  timeLimit!: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  points!: number;

  @Field(() => [SelectableOptionInput])
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => SelectableOptionInput)
  options!: SelectableOptionInput[];
}

@InputType()
export class UpdatePredictionPromptInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @Field()
  @IsString()
  @MaxLength(500)
  promptText!: string;

  @Field(() => Int)
  @IsInt()
  @Min(5)
  timeLimit!: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  points!: number;

  @Field(() => [SelectableOptionInput])
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => SelectableOptionInput)
  options!: SelectableOptionInput[];
}
