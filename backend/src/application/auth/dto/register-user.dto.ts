import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Register User DTO
 * Data Transfer Object for user registration
 */
export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
