import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * Login User DTO
 * Data Transfer Object for user login
 */
export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
