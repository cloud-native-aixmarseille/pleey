import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { RegenerateUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/regenerate-user-avatar-use-case';
import { GetCurrentUserUseCase } from '../../../application/identity/profile/use-cases/get-current-user-use-case';
import { GetUserGameHistoryUseCase } from '../../../application/identity/profile/use-cases/get-user-game-history-use-case';
import { UpdateUserProfileUseCase } from '../../../application/identity/profile/use-cases/update-user-profile-use-case';
import { RequestPasswordResetUseCase } from '../../../application/identity/recovery/use-cases/request-password-reset-use-case';
import { ResetPasswordUseCase } from '../../../application/identity/recovery/use-cases/reset-password-use-case';
import { GetCurrentSessionUseCase } from '../../../application/identity/session/use-cases/get-current-session-use-case';
import { ListOtherSessionsUseCase } from '../../../application/identity/session/use-cases/list-other-sessions-use-case';
import { LoginUserUseCase } from '../../../application/identity/session/use-cases/login-user-use-case';
import { LogoutUserUseCase } from '../../../application/identity/session/use-cases/logout-user-use-case';
import { RefreshAccessTokenUseCase } from '../../../application/identity/session/use-cases/refresh-access-token-use-case';
import { RegisterUserUseCase } from '../../../application/identity/session/use-cases/register-user-use-case';
import { RevokeOtherSessionsUseCase } from '../../../application/identity/session/use-cases/revoke-other-sessions-use-case';
import type { UserId } from '../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { GqlJwtAuthGuard } from '../shared/guards/gql-jwt-auth-guard';
import { AuthProfilePresenter } from '../shared/presenters/auth-profile-presenter';
import { AuthResponseType } from './types/auth-response-type';
import { AuthUserProfileType } from './types/auth-user-profile-type';
import { LoginInput } from './types/login-input';
import { ForgotPasswordInput, ResetPasswordInput } from './types/password-recovery-input';
import { RefreshTokenInput } from './types/refresh-token-input';
import { RegisterInput } from './types/register-input';
import { UpdateProfileInput } from './types/update-profile-input';
import { UserGameHistoryInput } from './types/user-game-history-input';
import { UserGameHistoryType } from './types/user-game-history-type';
import { RevokeUserSessionInput, UserSessionListInput } from './types/user-session-input';
import { UserSessionListType, UserSessionType } from './types/user-session-type';

type GraphqlAuthContext = {
  req?: Request & {
    user?: {
      id: UserId;
      sessionId: string;
    };
  };
  user?: {
    id: UserId;
    sessionId: string;
  };
};

@Resolver()
export class AuthResolver {
  constructor(
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly getUserGameHistoryUseCase: GetUserGameHistoryUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly regenerateUserAvatarUseCase: RegenerateUserAvatarUseCase,
    private readonly authProfilePresenter: AuthProfilePresenter,
    private readonly getCurrentSessionUseCase: GetCurrentSessionUseCase,
    private readonly listOtherSessionsUseCase: ListOtherSessionsUseCase,
    private readonly revokeOtherSessionsUseCase: RevokeOtherSessionsUseCase,
  ) {}

  @Mutation(() => Boolean)
  async forgotPassword(@Args('input') input: ForgotPasswordInput): Promise<boolean> {
    await this.requestPasswordResetUseCase.execute(input.email, input.locale);
    return true;
  }

  @Mutation(() => Boolean)
  async resetPassword(@Args('input') input: ResetPasswordInput): Promise<boolean> {
    await this.resetPasswordUseCase.execute(input.token, input.password);
    return true;
  }

  @Query(() => UserGameHistoryType)
  @UseGuards(GqlJwtAuthGuard)
  async myGameHistory(
    @Context() context: GraphqlAuthContext,
    @Args('input') input: UserGameHistoryInput,
  ): Promise<UserGameHistoryType> {
    return this.getUserGameHistoryUseCase.execute(this.resolveUserId(context), input);
  }

  @Mutation(() => AuthResponseType)
  async login(@Args('input') input: LoginInput, @Context() context: GraphqlAuthContext): Promise<AuthResponseType> {
    const response = await this.loginUserUseCase.execute(input, {
      userAgent: context.req?.get('user-agent')?.slice(0, 512) || null,
      ipAddress: context.req?.ip?.slice(0, 64) || null,
    });
    return this.authProfilePresenter.presentAuthResponse(response, context.req);
  }

  @Mutation(() => AuthUserProfileType)
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<AuthUserProfileType> {
    const profile = await this.registerUserUseCase.execute(input);
    return this.authProfilePresenter.presentUserProfile(profile, context.req);
  }

  @Mutation(() => AuthResponseType)
  async refresh(
    @Args('input') input: RefreshTokenInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<AuthResponseType> {
    const response = await this.refreshAccessTokenUseCase.execute(input.refreshToken);
    return this.authProfilePresenter.presentAuthResponse(response, context.req);
  }

  @Query(() => AuthUserProfileType)
  @UseGuards(GqlJwtAuthGuard)
  async me(@Context() context: GraphqlAuthContext): Promise<AuthUserProfileType> {
    const userId = this.resolveUserId(context);
    const profile = await this.getCurrentUserUseCase.execute(userId);
    return this.authProfilePresenter.presentUserProfile(profile, context.req);
  }

  @Mutation(() => AuthUserProfileType)
  @UseGuards(GqlJwtAuthGuard)
  async updateProfile(
    @Context() context: GraphqlAuthContext,
    @Args('input') input: UpdateProfileInput,
  ): Promise<AuthUserProfileType> {
    const userId = this.resolveUserId(context);
    const profile = await this.updateUserProfileUseCase.execute(userId, input);
    return this.authProfilePresenter.presentUserProfile(profile, context.req);
  }

  @Mutation(() => AuthUserProfileType)
  @UseGuards(GqlJwtAuthGuard)
  async regenerateAvatar(@Context() context: GraphqlAuthContext): Promise<AuthUserProfileType> {
    const userId = this.resolveUserId(context);
    const profile = await this.regenerateUserAvatarUseCase.execute(userId);
    return this.authProfilePresenter.presentUserProfile(profile, context.req);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async logout(@Context() context: GraphqlAuthContext): Promise<boolean> {
    const userId = this.resolveUserId(context);
    await this.logoutUserUseCase.execute(userId, this.resolveSessionId(context));
    return true;
  }

  @Query(() => UserSessionType)
  @UseGuards(GqlJwtAuthGuard)
  myCurrentSession(@Context() context: GraphqlAuthContext): Promise<UserSessionType> {
    return this.getCurrentSessionUseCase.execute(this.resolveUserId(context), this.resolveSessionId(context));
  }

  @Query(() => UserSessionListType)
  @UseGuards(GqlJwtAuthGuard)
  myOtherSessions(
    @Context() context: GraphqlAuthContext,
    @Args('input') input: UserSessionListInput,
  ): Promise<UserSessionListType> {
    return this.listOtherSessionsUseCase.execute(this.resolveUserId(context), this.resolveSessionId(context), input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async revokeSession(
    @Context() context: GraphqlAuthContext,
    @Args('input') input: RevokeUserSessionInput,
  ): Promise<boolean> {
    await this.logoutUserUseCase.execute(this.resolveUserId(context), input.sessionId);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async revokeOtherSessions(@Context() context: GraphqlAuthContext): Promise<boolean> {
    await this.revokeOtherSessionsUseCase.execute(this.resolveUserId(context), this.resolveSessionId(context));
    return true;
  }

  private resolveSessionId(context: GraphqlAuthContext): string {
    const sessionId = context.req?.user?.sessionId ?? context.user?.sessionId;
    if (!sessionId) throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    return sessionId;
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}
