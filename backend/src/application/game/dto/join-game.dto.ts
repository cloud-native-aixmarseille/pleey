import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * Join Game DTO
 * Data Transfer Object for joining a game
 */
export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
