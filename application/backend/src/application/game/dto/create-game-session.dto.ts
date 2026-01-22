import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { QuizId } from '../../../domain/quiz/entities/quiz';

/**
 * Create Game Session DTO
 * Data Transfer Object for creating a game session
 */
export class CreateGameSessionDto {
  @IsNumber()
  @IsNotEmpty()
  quizId: QuizId;

  @IsNumber()
  @IsOptional()
  hostId?: UserId;
}
