import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

/**
 * Create Game Session DTO
 * Data Transfer Object for creating a game session
 */
export class CreateGameSessionDto {
  @IsNumber()
  @IsNotEmpty()
  quizId: number;

  @IsNumber()
  @IsOptional()
  adminId?: number;
}
