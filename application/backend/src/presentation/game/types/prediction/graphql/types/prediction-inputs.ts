import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ImportPlayableContentInputBase } from '../../../shared/graphql/import-playable-content-inputs';
import { SelectableOptionInput } from '../../../shared/graphql/selectable-option-types';

@InputType()
export class CreatePredictionInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  projectId!: string;

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
export class CreatePredictionFromImportInput extends ImportPlayableContentInputBase {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  projectId!: string;

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

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  allowOptionChangeAfterVoting?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  randomizeStageOrder?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  randomizeOptionOrder?: boolean;
}

@InputType()
export class CreatePredictionPromptInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  predictionId!: string;

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
