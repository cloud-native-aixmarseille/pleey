import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GetGuestAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import { RegenerateUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/regenerate-user-avatar-use-case';
import { GetCurrentUserUseCase } from '../../../application/identity/profile/use-cases/get-current-user-use-case';
import { UpdateUserProfileUseCase } from '../../../application/identity/profile/use-cases/update-user-profile-use-case';
import { LoginUserUseCase } from '../../../application/identity/session/use-cases/login-user-use-case';
import { LogoutUserUseCase } from '../../../application/identity/session/use-cases/logout-user-use-case';
import { RefreshAccessTokenUseCase } from '../../../application/identity/session/use-cases/refresh-access-token-use-case';
import { RegisterUserUseCase } from '../../../application/identity/session/use-cases/register-user-use-case';
import {
  ACCESS_TOKEN_CONFIG,
  AuthTokenServiceProvider,
  type TokenConfig,
} from '../../../domain/auth/ports/auth-token.service';
import { AvatarGeneratorAdapterProvider } from '../../../domain/auth/ports/avatar-generator.adapter';
import { UserRepositoryProvider } from '../../../domain/auth/ports/user.repository';
import { PasswordService } from '../../../domain/auth/services/password-service';
import { UserAvatarService } from '../../../domain/auth/services/user-avatar-service';
import { GuestRepositoryProvider } from '../../../domain/game/ports/repositories/guest.repository';
import { JwtStrategy } from '../../../infrastructure/auth/jwt-strategy';
import { PrismaUserRepository } from '../../../infrastructure/auth/repositories/prisma-user-repository';
import { DicebearAvatarGeneratorAdapter } from '../../../infrastructure/auth/services/dicebear-avatar-generator-adapter';
import { JwtAuthTokenService } from '../../../infrastructure/auth/services/jwt-auth-token-service';
import { PrismaGuestRepository } from '../../../infrastructure/game/repositories/prisma-guest-repository';
import { AuthResolver } from '../../../presentation/identity/graphql/auth-resolver';
import { AvatarController } from '../../../presentation/identity/http/avatar-controller';
import { GqlJwtAuthGuard } from '../../../presentation/identity/shared/guards/gql-jwt-auth-guard';
import { AuthProfilePresenter } from '../../../presentation/identity/shared/presenters/auth-profile-presenter';
import { AppConfigModule } from '../../config/app-config.module';
import { DatabaseModule } from '../database/database-module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [ACCESS_TOKEN_CONFIG],
      useFactory: (accessTokenConfig: TokenConfig) => ({
        secret: accessTokenConfig.secret,
        signOptions: { expiresIn: accessTokenConfig.expiresInSeconds },
      }),
    }),
  ],
  controllers: [AvatarController],
  providers: [
    LoginUserUseCase,
    RefreshAccessTokenUseCase,
    LogoutUserUseCase,
    RegisterUserUseCase,
    GetCurrentUserUseCase,
    UpdateUserProfileUseCase,
    RegenerateUserAvatarUseCase,
    GetUserAvatarUseCase,
    GetGuestAvatarUseCase,
    PasswordService,
    DicebearAvatarGeneratorAdapter,
    AuthProfilePresenter,
    UserAvatarService,
    JwtAuthTokenService,
    PrismaUserRepository,
    PrismaGuestRepository,
    {
      provide: UserRepositoryProvider,
      useExisting: PrismaUserRepository,
    },
    {
      provide: GuestRepositoryProvider,
      useExisting: PrismaGuestRepository,
    },
    {
      provide: AuthTokenServiceProvider,
      useExisting: JwtAuthTokenService,
    },
    {
      provide: AvatarGeneratorAdapterProvider,
      useExisting: DicebearAvatarGeneratorAdapter,
    },
    JwtStrategy,
    GqlJwtAuthGuard,
    AuthResolver,
  ],
  exports: [JwtModule, PassportModule, JwtStrategy, GqlJwtAuthGuard],
})
export class AuthModule {}
