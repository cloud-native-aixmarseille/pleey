import { IsNotEmpty, IsString } from 'class-validator';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';

export class GamePinDto {
  @IsString()
  @IsNotEmpty()
  pin: GameSessionPin;
}
