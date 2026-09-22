import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { GetGuestAvatarPreviewUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-preview-use-case';
import { GetGuestAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import { RegenerateUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/regenerate-user-avatar-use-case';
import { GetCurrentUserUseCase } from '../../../application/identity/profile/use-cases/get-current-user-use-case';
import { GetUserGameHistoryUseCase } from '../../../application/identity/profile/use-cases/get-user-game-history-use-case';
import { UpdateUserProfileUseCase } from '../../../application/identity/profile/use-cases/update-user-profile-use-case';
import { DeliverPasswordResetUseCase } from '../../../application/identity/recovery/use-cases/deliver-password-reset-use-case';
import { RequestPasswordResetUseCase } from '../../../application/identity/recovery/use-cases/request-password-reset-use-case';
import { ResetPasswordUseCase } from '../../../application/identity/recovery/use-cases/reset-password-use-case';
import { GetCurrentSessionUseCase } from '../../../application/identity/session/use-cases/get-current-session-use-case';
import { ListOtherSessionsUseCase } from '../../../application/identity/session/use-cases/list-other-sessions-use-case';
import { LoginUserUseCase } from '../../../application/identity/session/use-cases/login-user-use-case';
import { LogoutUserUseCase } from '../../../application/identity/session/use-cases/logout-user-use-case';
import { RefreshAccessTokenUseCase } from '../../../application/identity/session/use-cases/refresh-access-token-use-case';
import { RegisterUserUseCase } from '../../../application/identity/session/use-cases/register-user-use-case';
import { RevokeOtherSessionsUseCase } from '../../../application/identity/session/use-cases/revoke-other-sessions-use-case';
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
import { PasswordRecoveryPortProvider } from '../../../domain/identity/ports/password-recovery.port';
import { PasswordResetMailerProvider } from '../../../domain/identity/ports/password-reset-mailer';
import { RecoveryTokenProvider } from '../../../domain/identity/ports/recovery-token';
import { UserRepositoryProvider } from '../../../domain/identity/ports/user.repository';
import { UserAuthenticationRepositoryProvider } from '../../../domain/identity/ports/user-authentication.repository';
import { UserGameHistoryPortProvider } from '../../../domain/identity/ports/user-game-history.port';
import { UserSessionManagementPortProvider } from '../../../domain/identity/ports/user-session-management.port';
import { PasswordService } from '../../../domain/identity/services/password-service';
import { UserAvatarService } from '../../../domain/identity/services/user-avatar-service';
import { OrganizationRepositoryProvider } from '../../../domain/organization/ports/organization.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { DefaultWorkspaceService } from '../../../domain/organization/services/default-workspace-service';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { JwtStrategy } from '../../../infrastructure/identity/jwt-strategy';
import { PrismaGuestRepository } from '../../../infrastructure/identity/repositories/prisma-guest-repository';
import { PrismaPasswordRecoveryAdapter } from '../../../infrastructure/identity/repositories/prisma-password-recovery-adapter';
import { PrismaUserAuthenticationRepository } from '../../../infrastructure/identity/repositories/prisma-user-authentication-repository';
import { PrismaUserGameHistoryAdapter } from '../../../infrastructure/identity/repositories/prisma-user-game-history-adapter';
import { PrismaUserRepository } from '../../../infrastructure/identity/repositories/prisma-user-repository';
import { PrismaUserSessionManagementAdapter } from '../../../infrastructure/identity/repositories/prisma-user-session-management-adapter';
import { CryptoRecoveryToken } from '../../../infrastructure/identity/services/crypto-recovery-token';
import { DicebearAvatarGeneratorAdapter } from '../../../infrastructure/identity/services/dicebear-avatar-generator-adapter';
import { JwtAuthTokenService } from '../../../infrastructure/identity/services/jwt-auth-token-service';
import { JwtSessionAuthenticator } from '../../../infrastructure/identity/services/jwt-session-authenticator';
import { PasswordResetDeliveryWorker } from '../../../infrastructure/identity/services/password-reset-delivery-worker';
import { SmtpPasswordResetMailer } from '../../../infrastructure/identity/services/smtp-password-reset-mailer';
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
    GetCurrentSessionUseCase,
    ListOtherSessionsUseCase,
    RevokeOtherSessionsUseCase,
    PrismaUserSessionManagementAdapter,
    { provide: UserSessionManagementPortProvider, useExisting: PrismaUserSessionManagementAdapter },
    GetUserGameHistoryUseCase,
    PrismaUserGameHistoryAdapter,
    { provide: UserGameHistoryPortProvider, useExisting: PrismaUserGameHistoryAdapter },
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    DeliverPasswordResetUseCase,
    PrismaPasswordRecoveryAdapter,
    CryptoRecoveryToken,
    SmtpPasswordResetMailer,
    PasswordResetDeliveryWorker,
    JwtSessionAuthenticator,
    { provide: PasswordRecoveryPortProvider, useExisting: PrismaPasswordRecoveryAdapter },
    { provide: PasswordResetMailerProvider, useExisting: SmtpPasswordResetMailer },
    { provide: RecoveryTokenProvider, useExisting: CryptoRecoveryToken },
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
    PrismaUserAuthenticationRepository,
    { provide: UserAuthenticationRepositoryProvider, useExisting: PrismaUserAuthenticationRepository },
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
    JwtSessionAuthenticator,
    JwtModule,
    PassportModule,
    JwtStrategy,
    GqlJwtAuthGuard,
    PasswordService,
    GuestRepositoryProvider,
    UserRepositoryProvider,
  ],
})
export class IdentityModule {}
