import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { RegenerateUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/regenerate-user-avatar-use-case';
import { GetCurrentUserUseCase } from '../../../application/identity/profile/use-cases/get-current-user-use-case';
import { GetUserGameHistoryUseCase } from '../../../application/identity/profile/use-cases/get-user-game-history-use-case';
import { UpdateUserProfileUseCase } from '../../../application/identity/profile/use-cases/update-user-profile-use-case';
import type { UserId } from '../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { AllowAnonymousSession, GqlAuthGuard } from '../shared/guards/gql-auth-guard';
import { AuthProfilePresenter } from '../shared/presenters/auth-profile-presenter';
import { AuthUserProfileType } from './types/auth-user-profile-type';
import { UpdateProfileInput } from './types/update-profile-input';
import { UserGameHistoryInput } from './types/user-game-history-input';
import { UserGameHistoryType } from './types/user-game-history-type';

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
    private readonly getUserGameHistoryUseCase: GetUserGameHistoryUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly regenerateUserAvatarUseCase: RegenerateUserAvatarUseCase,
    private readonly authProfilePresenter: AuthProfilePresenter,
  ) {}

  @Query(() => UserGameHistoryType)
  @AllowAnonymousSession()
  @UseGuards(GqlAuthGuard)
  async myGameHistory(
    @Context() context: GraphqlAuthContext,
    @Args('input') input: UserGameHistoryInput,
  ): Promise<UserGameHistoryType> {
    return this.getUserGameHistoryUseCase.execute(this.resolveUserId(context), input);
  }

  @Query(() => AuthUserProfileType)
  @AllowAnonymousSession()
  @UseGuards(GqlAuthGuard)
  async me(@Context() context: GraphqlAuthContext): Promise<AuthUserProfileType> {
    const userId = this.resolveUserId(context);
    const profile = await this.getCurrentUserUseCase.execute(userId);
    return this.authProfilePresenter.presentUserProfile(profile, context.req);
  }

  @Mutation(() => AuthUserProfileType)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @Context() context: GraphqlAuthContext,
    @Args('input') input: UpdateProfileInput,
  ): Promise<AuthUserProfileType> {
    const userId = this.resolveUserId(context);
    const profile = await this.updateUserProfileUseCase.execute(userId, input);
    return this.authProfilePresenter.presentUserProfile(profile, context.req);
  }

  @Mutation(() => AuthUserProfileType)
  @UseGuards(GqlAuthGuard)
  async regenerateAvatar(@Context() context: GraphqlAuthContext): Promise<AuthUserProfileType> {
    const userId = this.resolveUserId(context);
    const profile = await this.regenerateUserAvatarUseCase.execute(userId);
    return this.authProfilePresenter.presentUserProfile(profile, context.req);
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}
