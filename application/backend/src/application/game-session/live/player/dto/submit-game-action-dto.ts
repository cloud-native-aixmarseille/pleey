import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import type { UserId } from '../../../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
import type { GameActionId } from '../../../../../domain/game/entities/game-stage';
import type { GuestId } from '../../../../../domain/game/entities/player-state';

/**
 * Submit Game Action DTO
 * Data Transfer Object for submitting a game action
 * Supports both authenticated users (with userId) and guest players (with guestId)
 */
export class SubmitGameActionDto {
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
  actionId: GameActionId;

  @IsNumber()
  @IsNotEmpty()
  timeLeft: number;
}
