import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../../../domain/quiz/entities/question';
import type { QuestionAnswerId } from '../../../domain/quiz/entities/question-answer';
import type { QuizId } from '../../../domain/quiz/entities/quiz';

export class CreateQuestionAnswerRequestDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  id?: QuestionAnswerId;

  @IsString()
  @IsOptional()
  text?: string | null;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  position?: number;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

/**
 * HTTP DTO for creating a question
 */
export class CreateQuestionRequestDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  quizId: QuizId;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsIn(Object.values(QuestionType))
  type: QuestionType;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionAnswerRequestDto)
  answers: CreateQuestionAnswerRequestDto[];

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  points?: number;
}
