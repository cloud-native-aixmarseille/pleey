import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Register User DTO
 * Data Transfer Object for user registration
 */
export class RegisterUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  captchaToken!: string;

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
