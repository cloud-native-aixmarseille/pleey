import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { ProjectId } from '../../../domain/project/entities/project';

/**
 * Create Quiz DTO
 * Data Transfer Object for creating a quiz
 */
export class CreateQuizDto {
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
