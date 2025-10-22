import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUserDto } from '../../application/auth/dto/login-user.dto';
import { RegisterUserDto } from '../../application/auth/dto/register-user.dto';
import type { AuthResponseDto } from '../../application/auth/dto/auth-response.dto';
import { LoginUserUseCase } from '../../application/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/auth/use-cases/register-user.use-case';
import type { User } from '../../domain/auth/entities/user.entity';

type SafeUser = Omit<User, 'password'>;

@Controller()
export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    return this.loginUserUseCase.execute(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto): Promise<{ user: SafeUser }> {
    const user = await this.registerUserUseCase.execute(dto);
    return {
      user: user.toSafeObject(),
    };
  }
}
