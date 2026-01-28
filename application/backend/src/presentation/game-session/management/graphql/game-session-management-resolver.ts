import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateHostSessionUseCase } from '../../../../application/game-session/management/use-cases/create-host-session-use-case';
import { GetActiveHostSessionByPinUseCase } from '../../../../application/game-session/management/use-cases/get-active-host-session-by-pin-use-case';
import { GetCurrentPlayerSessionUseCase } from '../../../../application/game-session/management/use-cases/get-current-player-session-use-case';
import { LeaveCurrentPlayerSessionUseCase } from '../../../../application/game-session/management/use-cases/leave-current-player-session-use-case';
import { ListActiveHostSessionsUseCase } from '../../../../application/game-session/management/use-cases/list-active-host-sessions-use-case';
import { ListGameHostSessionsUseCase } from '../../../../application/game-session/management/use-cases/list-game-host-sessions-use-case';
import { ResumeHostSessionUseCase } from '../../../../application/game-session/management/use-cases/resume-host-session-use-case';
import { StopHostSessionUseCase } from '../../../../application/game-session/management/use-cases/stop-host-session-use-case';
import type { UserId } from '../../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import { GqlJwtAuthGuard } from '../../../identity/shared/guards/gql-jwt-auth-guard';
import { CreateGameSessionInput } from './types/create-game-session-input';
import {
  GameSessionListType,
  GameSessionParticipantRole,
  GameSessionType,
} from './types/game-session.type';

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
export class GameSessionManagementResolver {
  constructor(
    private readonly createHostSessionUseCase: CreateHostSessionUseCase,
    private readonly getActiveHostSessionByPinUseCase: GetActiveHostSessionByPinUseCase,
    private readonly getCurrentPlayerSessionUseCase: GetCurrentPlayerSessionUseCase,
    private readonly leaveCurrentPlayerSessionUseCase: LeaveCurrentPlayerSessionUseCase,
    private readonly listActiveHostSessionsUseCase: ListActiveHostSessionsUseCase,
    private readonly stopHostSessionUseCase: StopHostSessionUseCase,
    private readonly resumeHostSessionUseCase: ResumeHostSessionUseCase,
    private readonly listGameHostSessionsUseCase: ListGameHostSessionsUseCase,
  ) {}

  @Mutation(() => GameSessionType)
  @UseGuards(GqlJwtAuthGuard)
  async createGameSession(
    @Context() context: GraphqlAuthContext,
    @Args('input') input: CreateGameSessionInput,
  ): Promise<GameSessionType> {
    const userId = this.resolveUserId(context);
    const { session } = await this.createHostSessionUseCase.execute({
      gameId: input.gameId,
      hostId: userId,
    });

    return this.mapSession(session, GameSessionParticipantRole.HOST);
  }

  @Query(() => GameSessionListType)
  @UseGuards(GqlJwtAuthGuard)
  async activeSessions(@Context() context: GraphqlAuthContext): Promise<GameSessionListType> {
    const userId = this.resolveUserId(context);
    const sessions = await this.listActiveHostSessionsUseCase.execute(userId);

    return {
      sessions: sessions.map((session) =>
        this.mapSession(session, GameSessionParticipantRole.HOST),
      ),
    };
  }

  @Query(() => GameSessionType, { nullable: true })
  @UseGuards(GqlJwtAuthGuard)
  async currentPlayerSession(
    @Context() context: GraphqlAuthContext,
  ): Promise<GameSessionType | null> {
    const userId = this.resolveUserId(context);
    const session = await this.getCurrentPlayerSessionUseCase.execute(userId);

    return session ? this.mapSession(session, GameSessionParticipantRole.PLAYER) : null;
  }

  @Query(() => GameSessionType, { nullable: true })
  @UseGuards(GqlJwtAuthGuard)
  async activeSessionByPin(
    @Context() context: GraphqlAuthContext,
    @Args('pin') pin: string,
  ): Promise<GameSessionType | null> {
    const userId = this.resolveUserId(context);
    const session = await this.getActiveHostSessionByPinUseCase.execute(pin, userId);

    return session ? this.mapSession(session, GameSessionParticipantRole.HOST) : null;
  }

  @Query(() => GameSessionListType)
  @UseGuards(GqlJwtAuthGuard)
  async gameSessions(
    @Context() context: GraphqlAuthContext,
    @Args('gameId', { type: () => Int }) gameId: number,
  ): Promise<GameSessionListType> {
    const userId = this.resolveUserId(context);
    const sessions = await this.listGameHostSessionsUseCase.execute(gameId, userId);

    return {
      sessions: sessions.map((session) =>
        this.mapSession(session, GameSessionParticipantRole.HOST),
      ),
    };
  }

  @Mutation(() => GameSessionType)
  @UseGuards(GqlJwtAuthGuard)
  async stopGameSession(
    @Context() context: GraphqlAuthContext,
    @Args('sessionId', { type: () => Int }) sessionId: number,
  ): Promise<GameSessionType> {
    const userId = this.resolveUserId(context);
    const session = await this.stopHostSessionUseCase.execute(sessionId, userId);

    return this.mapSession(session, GameSessionParticipantRole.HOST);
  }

  @Mutation(() => GameSessionType)
  @UseGuards(GqlJwtAuthGuard)
  async resumeGameSession(
    @Context() context: GraphqlAuthContext,
    @Args('sessionId', { type: () => Int }) sessionId: number,
  ): Promise<GameSessionType> {
    const userId = this.resolveUserId(context);
    const session = await this.resumeHostSessionUseCase.execute(sessionId, userId);

    return this.mapSession(session, GameSessionParticipantRole.HOST);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async leaveCurrentPlayerSession(@Context() context: GraphqlAuthContext): Promise<boolean> {
    const userId = this.resolveUserId(context);

    return this.leaveCurrentPlayerSessionUseCase.execute(userId);
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(AuthErrorCode.UNAUTHORIZED);
    }

    return userId;
  }

  private mapSession(
    session: {
      id: number;
      gameId: number;
      pin: string;
      status: GameSessionStatus;
      currentStageId: number | null;
      createdAt: Date;
    },
    participantRole: GameSessionParticipantRole,
  ): GameSessionType {
    return {
      sessionId: session.id,
      gameId: session.gameId,
      pin: session.pin,
      status: session.status,
      currentStageId: session.currentStageId,
      participantRole,
      createdAt: session.createdAt,
    };
  }
}
