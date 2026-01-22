import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import type { GuestId } from '../../../domain/game/entities/player-state';
import type { QuestionAnswerId } from '../../../domain/quiz/entities/question-answer';

/**
 * Submit Answer DTO
 * Data Transfer Object for submitting an answer
 * Supports both authenticated users (with userId) and guest players (with guestId)
 */
export class SubmitAnswerDto {
  @IsString()
  @IsNotEmpty()
  pin: GameSessionPin;

  @IsNumber()
  @IsOptional()
  userId?: UserId;

  @IsString()
  @IsOptional()
  guestId?: GuestId;

  @IsNumber()
  @IsNotEmpty()
  answerId: QuestionAnswerId;

  @IsNumber()
  @IsNotEmpty()
  timeLeft: number;
}
