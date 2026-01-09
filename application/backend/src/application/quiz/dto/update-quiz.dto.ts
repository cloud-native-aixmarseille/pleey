import { IsOptional, IsString } from 'class-validator';

/**
 * Update Quiz DTO
 * Data Transfer Object for updating a quiz
 */
export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
