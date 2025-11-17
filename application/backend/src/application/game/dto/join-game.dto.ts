import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Join Game DTO
 * Data Transfer Object for joining a game
 * Supports both authenticated users (with userId) and guest players (without userId)
 */
export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsString()
  @IsOptional()
  guestId?: string;
}
