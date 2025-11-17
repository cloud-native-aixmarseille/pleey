import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * Create Question DTO
 * Data Transfer Object for creating a question
 */
export class CreateQuestionDto {
  @IsNumber()
  @IsNotEmpty()
  quizId: number;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsIn(['multiple', 'truefalse'])
  type: 'multiple' | 'truefalse';

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

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
