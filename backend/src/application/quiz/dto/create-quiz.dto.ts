import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Create Quiz DTO
 * Data Transfer Object for creating a quiz
 */
export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
