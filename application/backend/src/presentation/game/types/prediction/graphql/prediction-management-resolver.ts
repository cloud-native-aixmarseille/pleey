import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PredictionPromptIdentifier } from '../../../../../application/game/types/prediction/services/prediction-prompt-identifier';
import { PredictionSelectableOptionIdentifier } from '../../../../../application/game/types/prediction/services/prediction-selectable-option-identifier';
import { CreatePredictionFromImportUseCase } from '../../../../../application/game/types/prediction/use-cases/create-prediction-from-import-use-case';
import { CreatePredictionPromptUseCase } from '../../../../../application/game/types/prediction/use-cases/create-prediction-prompt-use-case';
import { CreatePredictionUseCase } from '../../../../../application/game/types/prediction/use-cases/create-prediction-use-case';
import { DeletePredictionPromptUseCase } from '../../../../../application/game/types/prediction/use-cases/delete-prediction-prompt-use-case';
import { DeletePredictionUseCase } from '../../../../../application/game/types/prediction/use-cases/delete-prediction-use-case';
import { GetPredictionUseCase } from '../../../../../application/game/types/prediction/use-cases/get-prediction-use-case';
import { ListPredictionPromptsUseCase } from '../../../../../application/game/types/prediction/use-cases/list-prediction-prompts-use-case';
import { UpdatePredictionPromptUseCase } from '../../../../../application/game/types/prediction/use-cases/update-prediction-prompt-use-case';
import { UpdatePredictionUseCase } from '../../../../../application/game/types/prediction/use-cases/update-prediction-use-case';
import { GameTypeIdentifier } from '../../../../../application/game/types/shared/services/game-type-identifier';
import { ProjectIdentifier } from '../../../../../application/workspace/shared/services/identifiers/project-identifier';
import type { Prediction } from '../../../../../domain/game/types/prediction/entities/prediction';
import type { PredictionPrompt } from '../../../../../domain/game/types/prediction/entities/prediction-prompt';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../../../domain/identity/enums/identity-error-code.enum';
import { GqlJwtAuthGuard } from '../../../../identity/shared/guards/gql-jwt-auth-guard';
import { PlayableContentUploadReader } from '../../shared/graphql/playable-content-upload-reader';
import { SelectableOptionInputMapper } from '../../shared/graphql/selectable-option-input-mapper';
import {
  CreatePredictionFromImportInput,
  CreatePredictionInput,
  CreatePredictionPromptInput,
  UpdatePredictionInput,
  UpdatePredictionPromptInput,
} from './types/prediction-inputs';
import { PredictionPromptType, PredictionType } from './types/prediction-types';

type GraphqlAuthContext = {
  req?: { user?: { id: UserId } };
  user?: { id: UserId };
};

@Resolver()
export class PredictionManagementResolver {
  constructor(
    private readonly createPredictionUseCase: CreatePredictionUseCase,
    private readonly createPredictionFromImportUseCase: CreatePredictionFromImportUseCase,
    private readonly updatePredictionUseCase: UpdatePredictionUseCase,
    private readonly deletePredictionUseCase: DeletePredictionUseCase,
    private readonly getPredictionUseCase: GetPredictionUseCase,
    private readonly createPredictionPromptUseCase: CreatePredictionPromptUseCase,
    private readonly listPredictionPromptsUseCase: ListPredictionPromptsUseCase,
    private readonly updatePredictionPromptUseCase: UpdatePredictionPromptUseCase,
    private readonly deletePredictionPromptUseCase: DeletePredictionPromptUseCase,
    private readonly gameTypeIdentifier: GameTypeIdentifier,
    private readonly predictionPromptIdentifier: PredictionPromptIdentifier,
    private readonly predictionSelectableOptionIdentifier: PredictionSelectableOptionIdentifier,
    private readonly playableContentUploadReader: PlayableContentUploadReader,
    private readonly selectableOptionInputMapper: SelectableOptionInputMapper,
    private readonly projectIdentifier: ProjectIdentifier,
  ) {}

  @Query(() => PredictionType)
  @UseGuards(GqlJwtAuthGuard)
  async prediction(
    @Args('predictionId', { type: () => Int }) predictionId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<PredictionType> {
    const prediction = await this.getPredictionUseCase.execute(
      this.gameTypeIdentifier.parse(predictionId),
      this.resolveUserId(context),
    );

    return this.mapPrediction(prediction);
  }

  @Mutation(() => PredictionType)
  @UseGuards(GqlJwtAuthGuard)
  async createPrediction(
    @Args('input') input: CreatePredictionInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<PredictionType> {
    const prediction = await this.createPredictionUseCase.execute(
      {
        projectId: this.projectIdentifier.parse(input.projectId),
        title: input.title,
        description: input.description ?? null,
      },
      this.resolveUserId(context),
    );

    return this.mapPrediction(prediction);
  }

  @Mutation(() => PredictionType)
  @UseGuards(GqlJwtAuthGuard)
  async createPredictionFromImport(
    @Args('input') input: CreatePredictionFromImportInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<PredictionType> {
    const source = await this.playableContentUploadReader.read(input.file);
    const prediction = await this.createPredictionFromImportUseCase.execute(
      {
        projectId: this.projectIdentifier.parse(input.projectId),
        title: input.title,
        description: input.description ?? null,
        source,
      },
      this.resolveUserId(context),
    );

    return this.mapPrediction(prediction);
  }

  @Mutation(() => PredictionType)
  @UseGuards(GqlJwtAuthGuard)
  async updatePrediction(
    @Args('predictionId', { type: () => Int }) predictionId: number,
    @Args('input') input: UpdatePredictionInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<PredictionType> {
    const prediction = await this.updatePredictionUseCase.execute(
      {
        predictionId: this.gameTypeIdentifier.parse(predictionId),
        title: input.title,
        description: input.description ?? null,
      },
      this.resolveUserId(context),
    );

    return this.mapPrediction(prediction);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deletePrediction(
    @Args('predictionId', { type: () => Int }) predictionId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<boolean> {
    return this.deletePredictionUseCase.execute(
      this.gameTypeIdentifier.parse(predictionId),
      this.resolveUserId(context),
    );
  }

  @Query(() => [PredictionPromptType])
  @UseGuards(GqlJwtAuthGuard)
  async predictionPrompts(
    @Args('predictionId', { type: () => Int }) predictionId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<PredictionPromptType[]> {
    const prompts = await this.listPredictionPromptsUseCase.execute(
      this.gameTypeIdentifier.parse(predictionId),
      this.resolveUserId(context),
    );

    return prompts.map((prompt) => this.mapPrompt(prompt));
  }

  @Mutation(() => PredictionPromptType)
  @UseGuards(GqlJwtAuthGuard)
  async createPredictionPrompt(
    @Args('input') input: CreatePredictionPromptInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<PredictionPromptType> {
    const prompt = await this.createPredictionPromptUseCase.execute(
      {
        predictionId: this.gameTypeIdentifier.parse(input.predictionId),
        position: input.position,
        promptText: input.promptText,
        timeLimit: input.timeLimit,
        points: input.points,
        options: this.selectableOptionInputMapper.toDomainInputs(
          input.options,
          this.predictionSelectableOptionIdentifier,
        ),
      },
      this.resolveUserId(context),
    );

    return this.mapPrompt(prompt);
  }

  @Mutation(() => PredictionPromptType)
  @UseGuards(GqlJwtAuthGuard)
  async updatePredictionPrompt(
    @Args('promptId', { type: () => Int }) promptId: number,
    @Args('input') input: UpdatePredictionPromptInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<PredictionPromptType> {
    const prompt = await this.updatePredictionPromptUseCase.execute(
      {
        promptId: this.predictionPromptIdentifier.parse(promptId),
        position: input.position,
        promptText: input.promptText,
        timeLimit: input.timeLimit,
        points: input.points,
        options: this.selectableOptionInputMapper.toDomainInputs(
          input.options,
          this.predictionSelectableOptionIdentifier,
        ),
      },
      this.resolveUserId(context),
    );

    return this.mapPrompt(prompt);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deletePredictionPrompt(
    @Args('promptId', { type: () => Int }) promptId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<boolean> {
    return this.deletePredictionPromptUseCase.execute(
      this.predictionPromptIdentifier.parse(promptId),
      this.resolveUserId(context),
    );
  }

  private mapPrediction(prediction: Prediction): PredictionType {
    return {
      predictionId: prediction.id,
      gameId: prediction.gameId,
      type: GameType.Prediction,
      title: prediction.title,
      description: prediction.description,
      createdAt: prediction.createdAt,
      promptCount: prediction.promptCount,
    };
  }

  private mapPrompt(prompt: PredictionPrompt): PredictionPromptType {
    return {
      id: prompt.id,
      predictionId: prompt.predictionId,
      position: prompt.position,
      promptText: prompt.promptText,
      timeLimit: prompt.timeLimit,
      points: prompt.points,
      options: prompt.options.map((option) => ({
        id: option.id,
        text: option.text,
        position: option.position,
        isCorrect: option.isCorrect,
      })),
    };
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}
