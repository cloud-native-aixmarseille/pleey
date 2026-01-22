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
import type { QuizId } from '../../../domain/quiz/entities/quiz';

export class CreateQuestionAnswerDto {
  @IsString()
  @IsOptional()
  text?: string | null;

  @IsNumber()
  @IsOptional()
  position?: number;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

/**
 * Create Question DTO
 * Data Transfer Object for creating a question
 */
export class CreateQuestionDto {
  @IsNumber()
  @IsNotEmpty()
  quizId: QuizId;

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
  @Type(() => CreateQuestionAnswerDto)
  answers: CreateQuestionAnswerDto[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  points?: number;
}
