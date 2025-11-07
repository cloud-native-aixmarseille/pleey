import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * Update Question DTO
 * Allows partial updates on an existing question
 */
export class UpdateQuestionDto {
  @IsNumber()
  @IsOptional()
  quizId?: number;

  @IsString()
  @IsOptional()
  questionText?: string;

  @IsString()
  @IsIn(['multiple', 'truefalse'])
  @IsOptional()
  type?: 'multiple' | 'truefalse';

  @IsString()
  @IsOptional()
  correctAnswer?: string;

  @IsString()
  @IsOptional()
  optionA?: string | null;

  @IsString()
  @IsOptional()
  optionB?: string | null;

  @IsString()
  @IsOptional()
  optionC?: string | null;

  @IsString()
  @IsOptional()
  optionD?: string | null;

  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  points?: number;
}
