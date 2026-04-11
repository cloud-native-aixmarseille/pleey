import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatePartyUseCase } from '../../../../application/game/party/host/use-cases/create-party-use-case';
import { ListPartiesUseCase } from '../../../../application/game/party/shared/use-cases/list-parties-use-case';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import type { UserId } from '../../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { GqlJwtAuthGuard } from '../../../identity/shared/guards/gql-jwt-auth-guard';
import { CreatePartyInput } from './types/create-party-input';
import { PartyType } from './types/party-type';

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
export class PartyManagementResolver {
  constructor(
    private readonly createPartyUseCase: CreatePartyUseCase,
    private readonly listPartiesUseCase: ListPartiesUseCase,
    private readonly gameIdentifier: GameIdentifier,
  ) {}

  @Mutation(() => PartyType)
  @UseGuards(GqlJwtAuthGuard)
  async createParty(
    @Args('input') input: CreatePartyInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<PartyType> {
    const userId = this.resolveUserId(context);

    return this.createPartyUseCase.execute({
      gameId: this.gameIdentifier.parse(input.gameId),
      hostUserId: userId,
    });
  }

  @Query(() => [PartyType])
  @UseGuards(GqlJwtAuthGuard)
  async listParties(@Context() context: GraphqlAuthContext): Promise<readonly PartyType[]> {
    const userId = this.resolveUserId(context);

    return this.listPartiesUseCase.execute({
      userId,
    });
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}
