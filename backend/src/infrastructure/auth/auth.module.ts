import process from 'node:process';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginUserUseCase } from '../../application/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/auth/use-cases/register-user.use-case';
import { GetCurrentUserUseCase } from '../../application/auth/use-cases/get-current-user.use-case';
import { UpdateUserProfileUseCase } from '../../application/auth/use-cases/update-user-profile.use-case';
import { RegenerateUserAvatarUseCase } from '../../application/auth/use-cases/regenerate-user-avatar.use-case';
import { UserRepositoryProvider } from '../../domain/auth/repositories/user.repository.interface';
import { PasswordService } from '../../domain/auth/services/password.service';
import { UserAvatarService } from '../../domain/auth/services/user-avatar.service';
import { AvatarGeneratorService } from '../../domain/shared/services/avatar-generator.service';
import { DatabaseModule } from '../database/database.module';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { AuthController } from './auth.controller';
import { ProfileController } from './profile.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [
    LoginUserUseCase,
    RegisterUserUseCase,
    GetCurrentUserUseCase,
    UpdateUserProfileUseCase,
    RegenerateUserAvatarUseCase,
    PasswordService,
    AvatarGeneratorService,
    UserAvatarService,
    PrismaUserRepository,
    {
      provide: UserRepositoryProvider,
      useExisting: PrismaUserRepository,
    },
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtModule, PassportModule, JwtStrategy, JwtAuthGuard],
})
export class AuthModule { }
