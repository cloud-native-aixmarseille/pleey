import { IsNotEmpty, IsNumber } from 'class-validator';

/**
 * Create Game Session DTO
 * Data Transfer Object for creating a game session
 */
export class CreateGameSessionDto {
  @IsNumber()
  @IsNotEmpty()
  quizId: number;

  @IsNumber()
  @IsNotEmpty()
  adminId: number;
}
