import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../../../domain/quiz/entities/question';
import type { QuestionAnswerId } from '../../../domain/quiz/entities/question-answer';
import type { QuizId } from '../../../domain/quiz/entities/quiz';

class UpdateQuestionAnswerRequestDto {
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
 * HTTP DTO for updating a question
 */
export class UpdateQuestionRequestDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  quizId?: QuizId;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsString()
  @IsOptional()
  questionText?: string;

  @IsString()
  @IsIn(Object.values(QuestionType))
  @IsOptional()
  type?: QuestionType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionAnswerRequestDto)
  @IsOptional()
  answers?: UpdateQuestionAnswerRequestDto[];

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
