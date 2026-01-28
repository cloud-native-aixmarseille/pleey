import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { GameId } from '../../../../domain/game/entities/game';

/**
 * Create Game Session DTO
 * Data Transfer Object for creating a game session
 */
export class CreateGameSessionDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: GameId;

  @IsNumber()
  @IsOptional()
  hostId?: UserId;
}
