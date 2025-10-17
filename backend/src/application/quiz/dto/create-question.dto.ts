import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

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
  optionA?: string;

  @IsString()
  @IsOptional()
  optionB?: string;

  @IsString()
  @IsOptional()
  optionC?: string;

  @IsString()
  @IsOptional()
  optionD?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  points?: number;
}
