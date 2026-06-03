import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { GetGuestAvatarPreviewUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-preview-use-case';
import { GetGuestAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import { RegenerateUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/regenerate-user-avatar-use-case';
import { GetCurrentUserUseCase } from '../../../application/identity/profile/use-cases/get-current-user-use-case';
import { UpdateUserProfileUseCase } from '../../../application/identity/profile/use-cases/update-user-profile-use-case';
import { LoginUserUseCase } from '../../../application/identity/session/use-cases/login-user-use-case';
import { LogoutUserUseCase } from '../../../application/identity/session/use-cases/logout-user-use-case';
import { RefreshAccessTokenUseCase } from '../../../application/identity/session/use-cases/refresh-access-token-use-case';
import { RegisterUserUseCase } from '../../../application/identity/session/use-cases/register-user-use-case';
import { GuestIdentifier } from '../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import {
  ACCESS_TOKEN_CONFIG,
  AuthTokenServiceProvider,
  type TokenConfig,
} from '../../../domain/identity/ports/auth-token.service';
import { AvatarGeneratorAdapterProvider } from '../../../domain/identity/ports/avatar-generator.adapter';
import { GuestRepositoryProvider } from '../../../domain/identity/ports/guest.repository';
import { UserRepositoryProvider } from '../../../domain/identity/ports/user.repository';
import { PasswordService } from '../../../domain/identity/services/password-service';
import { UserAvatarService } from '../../../domain/identity/services/user-avatar-service';
import { OrganizationRepositoryProvider } from '../../../domain/organization/ports/organization.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { DefaultWorkspaceService } from '../../../domain/organization/services/default-workspace-service';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { JwtStrategy } from '../../../infrastructure/identity/jwt-strategy';
import { PrismaGuestRepository } from '../../../infrastructure/identity/repositories/prisma-guest-repository';
import { PrismaUserRepository } from '../../../infrastructure/identity/repositories/prisma-user-repository';
import { DicebearAvatarGeneratorAdapter } from '../../../infrastructure/identity/services/dicebear-avatar-generator-adapter';
import { JwtAuthTokenService } from '../../../infrastructure/identity/services/jwt-auth-token-service';
import { PrismaOrganizationMemberRepository } from '../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaOrganizationRepository } from '../../../infrastructure/organization/repositories/prisma-organization-repository';
import { PrismaProjectRepository } from '../../../infrastructure/project/repositories/prisma-project-repository';
import { AuthResolver } from '../../../presentation/identity/graphql/auth-resolver';
import { AvatarController } from '../../../presentation/identity/http/avatar-controller';
import { GqlJwtAuthGuard } from '../../../presentation/identity/shared/guards/gql-jwt-auth-guard';
import { AuthProfilePresenter } from '../../../presentation/identity/shared/presenters/auth-profile-presenter';
import { AppConfigModule } from '../../config/app-config.module';
import { DatabaseModule } from '../database/database-module';
import { SharedServicesModule } from '../shared/shared-services.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    SharedServicesModule,
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
    GetGuestAvatarPreviewUseCase,
    GetGuestAvatarUseCase,
    GuestIdentifier,
    OrganizationIdentifier,
    OrganizationMemberIdentifier,
    PasswordService,
    PartyIdentifier,
    DefaultWorkspaceService,
    ProjectIdentifier,
    DicebearAvatarGeneratorAdapter,
    AuthProfilePresenter,
    UserIdentifier,
    UserAvatarService,
    JwtAuthTokenService,
    PrismaUserRepository,
    PrismaGuestRepository,
    PrismaOrganizationRepository,
    PrismaOrganizationMemberRepository,
    PrismaProjectRepository,
    {
      provide: UserRepositoryProvider,
      useExisting: PrismaUserRepository,
    },
    {
      provide: GuestRepositoryProvider,
      useExisting: PrismaGuestRepository,
    },
    {
      provide: OrganizationRepositoryProvider,
      useExisting: PrismaOrganizationRepository,
    },
    {
      provide: OrganizationMemberRepositoryProvider,
      useExisting: PrismaOrganizationMemberRepository,
    },
    {
      provide: ProjectRepositoryProvider,
      useExisting: PrismaProjectRepository,
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
  exports: [
    JwtModule,
    PassportModule,
    JwtStrategy,
    GqlJwtAuthGuard,
    GuestRepositoryProvider,
    UserRepositoryProvider,
  ],
})
export class IdentityModule {}
