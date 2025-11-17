import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Submit Answer DTO
 * Data Transfer Object for submitting an answer
 * Supports both authenticated users (with userId) and guest players (with guestId)
 */
export class SubmitAnswerDto {
  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsString()
  @IsOptional()
  guestId?: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsNumber()
  @IsNotEmpty()
  timeLeft: number;
}
