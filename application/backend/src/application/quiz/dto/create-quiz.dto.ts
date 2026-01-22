import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { OrganizationId } from '../../../domain/organization/entities/organization';

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
  organizationId: OrganizationId;
}
