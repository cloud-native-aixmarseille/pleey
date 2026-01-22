import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';

/**
 * Host Game Control DTO
 * Data Transfer Object for host-only game control operations (stop/resume/end)
 */
export class HostGameControlDto {
  @IsString()
  @IsNotEmpty()
  pin: GameSessionPin;

  @IsNumber()
  @IsNotEmpty()
  hostId: UserId;
}
