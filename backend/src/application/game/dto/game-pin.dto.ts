import { IsNotEmpty, IsString } from 'class-validator';

export class GamePinDto {
  @IsString()
  @IsNotEmpty()
  pin: string;
}
