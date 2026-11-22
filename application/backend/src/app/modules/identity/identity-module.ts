import { Module } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { GetGuestAvatarPreviewUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-preview-use-case';
import { GetGuestAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import { RegenerateUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/regenerate-user-avatar-use-case';
import { CaptchaPortProvider } from '../../../application/identity/captcha/ports/captcha.port';
import { GetCurrentUserUseCase } from '../../../application/identity/profile/use-cases/get-current-user-use-case';
import { GetUserGameHistoryUseCase } from '../../../application/identity/profile/use-cases/get-user-game-history-use-case';
import { UpdateUserProfileUseCase } from '../../../application/identity/profile/use-cases/update-user-profile-use-case';
import { GuestIdentifier } from '../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import { ThemeIdentifier } from '../../../application/workspace/themes/services/theme-identifier';
import { AvatarGeneratorAdapterProvider } from '../../../domain/identity/ports/avatar-generator.adapter';
import { GuestRepositoryProvider } from '../../../domain/identity/ports/guest.repository';
import { UserRepositoryProvider } from '../../../domain/identity/ports/user.repository';
import { UserGameHistoryPortProvider } from '../../../domain/identity/ports/user-game-history.port';
import { PasswordService } from '../../../domain/identity/services/password-service';
import { UserAvatarService } from '../../../domain/identity/services/user-avatar-service';
import { OrganizationRepositoryProvider } from '../../../domain/organization/ports/organization.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { DefaultWorkspaceService } from '../../../domain/organization/services/default-workspace-service';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { PrismaService } from '../../../infrastructure/database/prisma-service';
import { PrismaPartySettingsMapper } from '../../../infrastructure/game/shared/prisma-party-settings.mapper';
import { BETTER_AUTH } from '../../../infrastructure/identity/better-auth.token';
import { type BetterAuthRuntimeConfig, createBetterAuth } from '../../../infrastructure/identity/better-auth-config';
import { BETTER_AUTH_CONFIG } from '../../../infrastructure/identity/better-auth-config.token';
import { BetterAuthSessionAdapter } from '../../../infrastructure/identity/better-auth-session.adapter';
import { CapCaptchaAdapter } from '../../../infrastructure/identity/captcha/cap-captcha-adapter';
import { ValkeyCaptchaStore } from '../../../infrastructure/identity/captcha/valkey-captcha-store';
import { IdentityTransferService } from '../../../infrastructure/identity/identity-transfer.service';
import { PrismaGuestRepository } from '../../../infrastructure/identity/repositories/prisma-guest-repository';
import { PrismaUserGameHistoryAdapter } from '../../../infrastructure/identity/repositories/prisma-user-game-history-adapter';
import { PrismaUserRepository } from '../../../infrastructure/identity/repositories/prisma-user-repository';
import { DicebearAvatarGeneratorAdapter } from '../../../infrastructure/identity/services/dicebear-avatar-generator-adapter';
import { PrismaOrganizationMemberRepository } from '../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaOrganizationRepository } from '../../../infrastructure/organization/repositories/prisma-organization-repository';
import { PrismaProjectRepository } from '../../../infrastructure/project/repositories/prisma-project-repository';
import { AuthResolver } from '../../../presentation/identity/graphql/auth-resolver';
import { AvatarController } from '../../../presentation/identity/http/avatar-controller';
import { CaptchaController } from '../../../presentation/identity/http/captcha-controller';
import { GqlAuthGuard } from '../../../presentation/identity/shared/guards/gql-auth-guard';
import { AuthProfilePresenter } from '../../../presentation/identity/shared/presenters/auth-profile-presenter';
import { AppConfigModule } from '../../config/app-config.module';
import { DatabaseModule } from '../database/database-module';
import { SharedServicesModule } from '../shared/shared-services.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, SharedServicesModule],
  controllers: [AvatarController, CaptchaController],
  providers: [
    {
      provide: BETTER_AUTH,
      inject: [PrismaService, BETTER_AUTH_CONFIG, IdentityTransferService, I18nService],
      useFactory: (
        prisma: PrismaService,
        config: BetterAuthRuntimeConfig,
        identityTransfers: IdentityTransferService,
        i18n: I18nService,
      ) => createBetterAuth(prisma, config, identityTransfers, i18n),
    },
    BetterAuthSessionAdapter,
    IdentityTransferService,
    ThemeIdentifier,
    CapCaptchaAdapter,
    ValkeyCaptchaStore,
    { provide: CaptchaPortProvider, useExisting: CapCaptchaAdapter },
    GetUserGameHistoryUseCase,
    PrismaUserGameHistoryAdapter,
    { provide: UserGameHistoryPortProvider, useExisting: PrismaUserGameHistoryAdapter },
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
    PrismaUserRepository,
    PrismaGuestRepository,
    PrismaPartySettingsMapper,
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
      provide: AvatarGeneratorAdapterProvider,
      useExisting: DicebearAvatarGeneratorAdapter,
    },
    GqlAuthGuard,
    AuthResolver,
  ],
  exports: [
    BETTER_AUTH,
    BetterAuthSessionAdapter,
    GqlAuthGuard,
    PasswordService,
    GuestRepositoryProvider,
    UserRepositoryProvider,
  ],
})
export class IdentityModule {}
