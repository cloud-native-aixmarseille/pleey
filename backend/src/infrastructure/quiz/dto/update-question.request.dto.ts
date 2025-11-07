import { Expose, Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * HTTP DTO for updating a question with snake_case payload support
 */
export class UpdateQuestionRequestDto {
  @Expose({ name: 'quiz_id' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  quizId?: number;

  @Expose({ name: 'question_text' })
  @IsString()
  @IsOptional()
  questionText?: string;

  @IsString()
  @IsIn(['multiple', 'truefalse'])
  @IsOptional()
  type?: 'multiple' | 'truefalse';

  @Expose({ name: 'correct_answer' })
  @IsString()
  @IsOptional()
  correctAnswer?: string;

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
