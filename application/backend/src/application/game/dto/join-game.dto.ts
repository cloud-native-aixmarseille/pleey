import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import type { GuestId } from '../../../domain/game/entities/player-state';

/**
 * Join Game DTO
 * Data Transfer Object for joining a game
 * Supports both authenticated users (with userId) and guest players (without userId)
 */
export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  pin: GameSessionPin;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @IsOptional()
  userId?: UserId;

  @IsString()
  @IsOptional()
  guestId?: GuestId;
}
