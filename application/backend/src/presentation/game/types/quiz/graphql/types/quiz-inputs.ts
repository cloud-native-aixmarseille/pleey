import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
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
  @Field(() => Int)
  @IsInt()
  @Min(1)
  quizId!: number;

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

@InputType()
export class ImportQuizQuestionsInput extends ImportPlayableContentInputBase {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  quizId!: number;
}
