import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuizQuestionType } from '../../../../../../domain/game/types/quiz/entities/quiz-question';
import { ImportPlayableContentInputBase } from '../../../shared/graphql/import-playable-content-inputs';
import { SelectableOptionInput } from '../../../shared/graphql/selectable-option-types';

@InputType()
export class CreateQuizInput {
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
export class CreateQuizFromImportInput extends ImportPlayableContentInputBase {
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
export class UpdateQuizInput {
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
export class CreateQuizQuestionInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  quizId!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @Field()
  @IsString()
  @MaxLength(500)
  questionText!: string;

  @Field(() => QuizQuestionType)
  @IsEnum(QuizQuestionType)
  type!: QuizQuestionType;

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
  answers!: SelectableOptionInput[];
}

@InputType()
export class UpdateQuizQuestionInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @Field()
  @IsString()
  @MaxLength(500)
  questionText!: string;

  @Field(() => QuizQuestionType)
  @IsEnum(QuizQuestionType)
  type!: QuizQuestionType;

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
  answers!: SelectableOptionInput[];
}
