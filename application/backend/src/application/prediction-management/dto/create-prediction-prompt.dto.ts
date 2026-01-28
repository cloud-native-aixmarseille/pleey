import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import type { PredictionId } from '../../../domain/prediction/entities/prediction';
import type { PredictionOptionId } from '../../../domain/prediction/entities/prediction-option';

class CreatePredictionOptionDto {
  @IsNumber()
  @IsOptional()
  id?: PredictionOptionId;

  @IsString()
  @IsOptional()
  text?: string | null;

  @IsNumber()
  @IsOptional()
  position?: number;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

/**
 * Create Prediction Prompt DTO
 * Data Transfer Object for creating prediction prompts
 */
export class CreatePredictionPromptDto {
  @IsNumber()
  @IsNotEmpty()
  predictionId: PredictionId;

  @IsNumber()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsString()
  @IsNotEmpty()
  promptText: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreatePredictionOptionDto)
  options: CreatePredictionOptionDto[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  points?: number;
}
