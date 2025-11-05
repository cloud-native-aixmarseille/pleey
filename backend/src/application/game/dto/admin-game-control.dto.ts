import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * Admin Game Control DTO
 * Data Transfer Object for admin-only game control operations (stop/resume)
 */
export class AdminGameControlDto {
  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsNumber()
  @IsNotEmpty()
  adminId: number;
}
