import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Update Profile DTO
 * Allows authenticated users to update their profile information
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9_-]+$/)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
