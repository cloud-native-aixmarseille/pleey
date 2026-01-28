import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { RegenerateUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/regenerate-user-avatar-use-case';
import { GetCurrentUserUseCase } from '../../../application/identity/profile/use-cases/get-current-user-use-case';
import { UpdateUserProfileUseCase } from '../../../application/identity/profile/use-cases/update-user-profile-use-case';
import { LoginUserUseCase } from '../../../application/identity/session/use-cases/login-user-use-case';
import { LogoutUserUseCase } from '../../../application/identity/session/use-cases/logout-user-use-case';
import { RefreshAccessTokenUseCase } from '../../../application/identity/session/use-cases/refresh-access-token-use-case';
import { RegisterUserUseCase } from '../../../application/identity/session/use-cases/register-user-use-case';
import type { UserId } from '../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { GqlJwtAuthGuard } from '../shared/guards/gql-jwt-auth-guard';
import { AuthProfilePresenter } from '../shared/presenters/auth-profile-presenter';
import { AuthResponseType } from './types/auth-response-type';
import { AuthUserProfileType } from './types/auth-user-profile-type';
import { LoginInput } from './types/login-input';
import { RefreshTokenInput } from './types/refresh-token-input';
import { RegisterInput } from './types/register-input';
import { UpdateProfileInput } from './types/update-profile-input';

type GraphqlAuthContext = {
  req?: Request & {
    user?: {
      id: UserId;
    };
  };
  user?: {
    id: UserId;
  };
};

@Resolver()
export class AuthResolver {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly regenerateUserAvatarUseCase: RegenerateUserAvatarUseCase,
    private readonly authProfilePresenter: AuthProfilePresenter,
  ) {}

  @Mutation(() => AuthResponseType)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<AuthResponseType> {
    const response = await this.loginUserUseCase.execute(input);
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
    await this.logoutUserUseCase.execute(userId);
    return true;
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(AuthErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}
