import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { ProjectId } from '../../../domain/project/entities/project';

/**
 * Create Prediction Game DTO
 * Data Transfer Object for creating a prediction game
 */
export class CreatePredictionGameDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  projectId: ProjectId;
}
