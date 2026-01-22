import process from 'node:process';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GetCurrentUserUseCase } from '../../application/auth/use-cases/get-current-user.use-case';
import { GetSessionAvatarUseCase } from '../../application/auth/use-cases/get-session-avatar.use-case';
import { GetUserAvatarUseCase } from '../../application/auth/use-cases/get-user-avatar.use-case';
import { LoginUserUseCase } from '../../application/auth/use-cases/login-user.use-case';
import { LogoutUserUseCase } from '../../application/auth/use-cases/logout-user.use-case';
import { RefreshAccessTokenUseCase } from '../../application/auth/use-cases/refresh-access-token.use-case';
import { RegenerateUserAvatarUseCase } from '../../application/auth/use-cases/regenerate-user-avatar.use-case';
import { RegisterUserUseCase } from '../../application/auth/use-cases/register-user.use-case';
import { UpdateUserProfileUseCase } from '../../application/auth/use-cases/update-user-profile.use-case';
import {
  ACCESS_TOKEN_CONFIG,
  AuthTokenServiceProvider,
  REFRESH_TOKEN_CONFIG,
} from '../../domain/auth/ports/auth-token.service';
import { AvatarGeneratorAdapterProvider } from '../../domain/auth/ports/avatar-generator.adapter';
import { UserRepositoryProvider } from '../../domain/auth/ports/user.repository';
import { PasswordService } from '../../domain/auth/services/password.service';
import { UserAvatarService } from '../../domain/auth/services/user-avatar.service';
import { DatabaseModule } from '../database/database.module';
import { getEnvOrFile, getRequiredEnvOrFile } from '../shared/env-secret.util';
import { AuthController } from './auth.controller';
import { AvatarController } from './avatar.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ProfileController } from './profile.controller';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { RolesGuard } from './roles.guard';
import { DicebearAvatarGeneratorAdapter } from './services/dicebear-avatar-generator.adapter';
import { JwtAuthTokenService } from './services/jwt-auth-token.service';

const jwtSecret = getRequiredEnvOrFile('JWT_SECRET');

const accessTokenExpiresIn = Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS ?? 3600);
if (!Number.isFinite(accessTokenExpiresIn) || accessTokenExpiresIn <= 0) {
  throw new Error('JWT_ACCESS_EXPIRES_IN_SECONDS must be a positive number');
}

const refreshTokenSecret = getEnvOrFile('JWT_REFRESH_SECRET') ?? jwtSecret;
const refreshTokenExpiresIn = Number(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS ?? 1209600);
if (!Number.isFinite(refreshTokenExpiresIn) || refreshTokenExpiresIn <= 0) {
  throw new Error('JWT_REFRESH_EXPIRES_IN_SECONDS must be a positive number');
}

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: accessTokenExpiresIn },
    }),
  ],
  controllers: [AuthController, ProfileController, AvatarController],
  providers: [
    LoginUserUseCase,
    RefreshAccessTokenUseCase,
    LogoutUserUseCase,
    RegisterUserUseCase,
    GetCurrentUserUseCase,
    UpdateUserProfileUseCase,
    RegenerateUserAvatarUseCase,
    GetUserAvatarUseCase,
    GetSessionAvatarUseCase,
    PasswordService,
    DicebearAvatarGeneratorAdapter,
    UserAvatarService,
    JwtAuthTokenService,
    PrismaUserRepository,
    {
      provide: UserRepositoryProvider,
      useExisting: PrismaUserRepository,
    },
    {
      provide: AuthTokenServiceProvider,
      useExisting: JwtAuthTokenService,
    },
    {
      provide: AvatarGeneratorAdapterProvider,
      useExisting: DicebearAvatarGeneratorAdapter,
    },
    {
      provide: ACCESS_TOKEN_CONFIG,
      useValue: {
        secret: jwtSecret,
        expiresInSeconds: accessTokenExpiresIn,
      },
    },
    {
      provide: REFRESH_TOKEN_CONFIG,
      useValue: {
        secret: refreshTokenSecret,
        expiresInSeconds: refreshTokenExpiresIn,
      },
    },
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [JwtModule, PassportModule, JwtStrategy, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
