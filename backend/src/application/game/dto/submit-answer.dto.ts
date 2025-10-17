import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * Submit Answer DTO
 * Data Transfer Object for submitting an answer
 */
export class SubmitAnswerDto {
  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsNumber()
  @IsNotEmpty()
  timeLeft: number;
}
