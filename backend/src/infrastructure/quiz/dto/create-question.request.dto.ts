import { Expose, Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * HTTP DTO for creating a question with snake_case payload support
 */
export class CreateQuestionRequestDto {
  @Expose({ name: 'quiz_id' })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  quizId: number;

  @Expose({ name: 'question_text' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsIn(['multiple', 'truefalse'])
  type: 'multiple' | 'truefalse';

  @Expose({ name: 'correct_answer' })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @Expose({ name: 'option_a' })
  @IsString()
  @IsOptional()
  optionA?: string | null;

  @Expose({ name: 'option_b' })
  @IsString()
  @IsOptional()
  optionB?: string | null;

  @Expose({ name: 'option_c' })
  @IsString()
  @IsOptional()
  optionC?: string | null;

  @Expose({ name: 'option_d' })
  @IsString()
  @IsOptional()
  optionD?: string | null;

  @Expose({ name: 'time_limit' })
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
