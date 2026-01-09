import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * Host Game Control DTO
 * Data Transfer Object for host-only game control operations (stop/resume/end)
 */
export class HostGameControlDto {
  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsNumber()
  @IsNotEmpty()
  hostId: number;
}
