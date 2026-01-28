import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatePredictionGameUseCase } from '../../../application/prediction-management/use-cases/create-prediction-game-use-case';
import { CreatePredictionPromptUseCase } from '../../../application/prediction-management/use-cases/create-prediction-prompt-use-case';
import { DeletePredictionPromptUseCase } from '../../../application/prediction-management/use-cases/delete-prediction-prompt-use-case';
import { ListPredictionPromptsUseCase } from '../../../application/prediction-management/use-cases/list-prediction-prompts-use-case';
import { ListProjectPredictionGamesUseCase } from '../../../application/prediction-management/use-cases/list-project-prediction-games-use-case';
import { UpdatePredictionPromptUseCase } from '../../../application/prediction-management/use-cases/update-prediction-prompt-use-case';
import type { UserId } from '../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import type { PredictionPrompt } from '../../../domain/prediction/entities/prediction-prompt';
import { GqlJwtAuthGuard } from '../../identity/shared/guards/gql-jwt-auth-guard';
import { CreatePredictionGameInput } from './types/prediction.input';
import { PredictionGameType, PredictionPromptType } from './types/prediction.type';
import {
  CreatePredictionPromptInput,
  UpdatePredictionPromptInput,
} from './types/prediction-prompt.input';

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
export class PredictionResolver {
  constructor(
    private readonly createPredictionGameUseCase: CreatePredictionGameUseCase,
    private readonly listProjectPredictionGamesUseCase: ListProjectPredictionGamesUseCase,
    private readonly listPredictionPromptsUseCase: ListPredictionPromptsUseCase,
    private readonly createPredictionPromptUseCase: CreatePredictionPromptUseCase,
    private readonly updatePredictionPromptUseCase: UpdatePredictionPromptUseCase,
    private readonly deletePredictionPromptUseCase: DeletePredictionPromptUseCase,
  ) {}

  @Mutation(() => PredictionGameType)
  @UseGuards(GqlJwtAuthGuard)
  async createPredictionGame(
    @Args('input') input: CreatePredictionGameInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<PredictionGameType> {
    const userId = this.resolveUserId(context);
    const { game, prediction } = await this.createPredictionGameUseCase.execute(input, userId);

    return {
      id: game.id,
      predictionId: prediction.id,
      type: game.type,
      title: game.title,
      description: game.description,
      projectId: game.projectId,
      createdAt: game.createdAt,
      promptCount: prediction.promptCount,
    };
  }

  @Query(() => [PredictionGameType])
  @UseGuards(GqlJwtAuthGuard)
  async predictionGamesByProject(
    @Args('projectId', { type: () => Int }) projectId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<PredictionGameType[]> {
    const userId = this.resolveUserId(context);
    const games = await this.listProjectPredictionGamesUseCase.execute(projectId, userId);

    return games.map(({ game, prediction }) => ({
      id: game.id,
      predictionId: prediction.id,
      type: game.type,
      title: game.title,
      description: game.description,
      projectId: game.projectId,
      createdAt: game.createdAt,
      promptCount: prediction.promptCount,
    }));
  }

  @Query(() => [PredictionPromptType])
  @UseGuards(GqlJwtAuthGuard)
  async predictionPrompts(
    @Args('predictionId', { type: () => Int }) predictionId: number,
  ): Promise<PredictionPromptType[]> {
    const prompts = await this.listPredictionPromptsUseCase.execute(predictionId);
    return prompts.map((prompt) => this.mapPredictionPrompt(prompt));
  }

  @Mutation(() => PredictionPromptType)
  @UseGuards(GqlJwtAuthGuard)
  async createPredictionPrompt(
    @Args('input') input: CreatePredictionPromptInput,
  ): Promise<PredictionPromptType> {
    const prompt = await this.createPredictionPromptUseCase.execute(input);
    return this.mapPredictionPrompt(prompt);
  }

  @Mutation(() => PredictionPromptType)
  @UseGuards(GqlJwtAuthGuard)
  async updatePredictionPrompt(
    @Args('promptId', { type: () => Int }) promptId: number,
    @Args('input') input: UpdatePredictionPromptInput,
  ): Promise<PredictionPromptType> {
    const prompt = await this.updatePredictionPromptUseCase.execute(promptId, input);
    return this.mapPredictionPrompt(prompt);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deletePredictionPrompt(
    @Args('promptId', { type: () => Int }) promptId: number,
  ): Promise<boolean> {
    await this.deletePredictionPromptUseCase.execute(promptId);
    return true;
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(AuthErrorCode.UNAUTHORIZED);
    }

    return userId;
  }

  private mapPredictionPrompt(prompt: PredictionPrompt): PredictionPromptType {
    return {
      id: prompt.id,
      predictionId: prompt.predictionId,
      position: prompt.position,
      promptText: prompt.promptText,
      options: prompt.options.map((option) => ({
        id: option.id,
        text: option.text,
        position: option.position,
        isCorrect: option.isCorrect,
      })),
      timeLimit: prompt.timeLimit,
      points: prompt.points,
    };
  }
}
