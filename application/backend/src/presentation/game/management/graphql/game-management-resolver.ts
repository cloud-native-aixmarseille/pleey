import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { ListProjectGamesUseCase } from '../../../../application/game/management/use-cases/list-project-games-use-case';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import type { UserId } from '../../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { GqlJwtAuthGuard } from '../../../identity/shared/guards/gql-jwt-auth-guard';
import { ProjectGamesInput } from './types/project-games-input';
import { ProjectGamesType } from './types/project-games-type';

type GraphqlAuthContext = {
  req?: {
    user?: {
      id: UserId;
    };
  };
  user?: {
    id: UserId;
  };
};

@Resolver()
export class GameManagementResolver {
  constructor(
    private readonly listProjectGamesUseCase: ListProjectGamesUseCase,
    private readonly projectIdentifier: ProjectIdentifier,
  ) {}

  @Query(() => ProjectGamesType)
  @UseGuards(GqlJwtAuthGuard)
  async projectGames(
    @Args('input') input: ProjectGamesInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<ProjectGamesType> {
    const userId = this.resolveUserId(context);

    return this.listProjectGamesUseCase.execute(
      {
        ...input,
        projectId: this.projectIdentifier.parse(input.projectId),
      },
      userId,
    );
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}
