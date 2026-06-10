import { inject, injectable } from 'inversify';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { PredictionPromptIdentifier } from '../../../../application/game/types/prediction/services/prediction-prompt-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import type { PredictionPromptId } from '../../../../domains/game/types/prediction/entities/prediction-prompt-id';
import type { PredictionManagementRepository } from '../../../../domains/game/types/prediction/ports/prediction-management.repository';
import type { GameTypeId } from '../../../../domains/game/types/shared/game-type';
import type {
  PlayableContentImportCreationInput,
  PlayableContentImportCreationResult,
  PlayableGameMetadataInput,
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../domains/project/entities/project';
import { GraphqlClient } from '../../../graphql/client/graphql-client';
import {
  CreatePredictionFromImportManagementDocument,
  type CreatePredictionFromImportManagementMutation,
  CreatePredictionManagementDocument,
  CreatePredictionPromptManagementDocument,
  type CreatePredictionPromptManagementMutation,
  DeletePredictionManagementDocument,
  DeletePredictionPromptManagementDocument,
  PredictionManagementDocument,
  type PredictionManagementQuery,
  UpdatePredictionManagementDocument,
  UpdatePredictionPromptManagementDocument,
  type UpdatePredictionPromptManagementMutation,
} from '../../../graphql/generated/graphql';
import { PlayableManagementGraphqlMapper } from '../shared/playable-management-graphql.mapper';

type GraphqlPredictionPrompt =
  | PredictionManagementQuery['predictionPrompts'][number]
  | NonNullable<CreatePredictionPromptManagementMutation['createPredictionPrompt']>
  | NonNullable<UpdatePredictionPromptManagementMutation['updatePredictionPrompt']>;

@injectable()
export class GraphqlPredictionManagementRepository implements PredictionManagementRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(GameIdentifier)
    private readonly gameIdentifier: GameIdentifier,
    @inject(GameTypeIdentifier)
    private readonly gameTypeIdentifier: GameTypeIdentifier,
    @inject(PredictionPromptIdentifier)
    private readonly predictionPromptIdentifier: PredictionPromptIdentifier,
    @inject(PlayableManagementGraphqlMapper)
    private readonly mapper: PlayableManagementGraphqlMapper,
  ) {}

  async createPrediction(
    projectId: ProjectId,
    input: PlayableGameMetadataInput,
  ): Promise<GameTypeId> {
    const result = await this.graphqlClient.request(CreatePredictionManagementDocument, {
      input: { ...input, projectId },
    });

    if (!result.createPrediction) {
      throw new Error('Prediction creation did not return a prediction');
    }

    return this.gameTypeIdentifier.parse(result.createPrediction.predictionId);
  }

  async createPredictionFromImport(
    projectId: ProjectId,
    input: PlayableContentImportCreationInput,
  ): Promise<PlayableContentImportCreationResult> {
    const result = await this.graphqlClient.request(CreatePredictionFromImportManagementDocument, {
      input: { ...input, projectId },
    });

    return this.mapImportCreationResult(result.createPredictionFromImport);
  }

  async load(predictionId: GameTypeId): Promise<PlayableManagementState<PredictionPromptId>> {
    const result = await this.graphqlClient.request(PredictionManagementDocument, {
      predictionId,
    });
    const gameTypeId = this.gameTypeIdentifier.parse(result.prediction.predictionId);

    return {
      game: this.mapper.mapGame({
        gameTypeId,
        gameId: this.gameIdentifier.parse(result.prediction.gameId),
        title: result.prediction.title,
        description: result.prediction.description,
        allowOptionChangeAfterVoting: result.prediction.allowOptionChangeAfterVoting,
        randomizeStageOrder: result.prediction.randomizeStageOrder,
        randomizeOptionOrder: result.prediction.randomizeOptionOrder,
        createdAt: result.prediction.createdAt,
        itemCount: result.prediction.promptCount,
      }),
      items: result.predictionPrompts.map((prompt) =>
        this.mapper.mapItem({
          id: this.predictionPromptIdentifier.parse(prompt.id),
          gameTypeId,
          position: prompt.position,
          text: prompt.promptText,
          timeLimit: prompt.timeLimit,
          points: prompt.points,
          options: prompt.options,
        }),
      ),
    };
  }

  async updateMetadata(predictionId: GameTypeId, input: PlayableGameMetadataInput): Promise<void> {
    await this.graphqlClient.request(UpdatePredictionManagementDocument, {
      predictionId,
      input: {
        title: input.title,
        description: input.description,
        allowOptionChangeAfterVoting: input.allowOptionChangeAfterVoting,
        randomizeStageOrder: input.randomizeStageOrder,
        randomizeOptionOrder: input.randomizeOptionOrder,
      },
    });
  }

  async deletePrediction(predictionId: GameTypeId): Promise<void> {
    await this.graphqlClient.request(DeletePredictionManagementDocument, { predictionId });
  }

  async createPrompt(
    predictionId: GameTypeId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<PredictionPromptId>> {
    const result = await this.graphqlClient.request(CreatePredictionPromptManagementDocument, {
      input: {
        ...this.mapper.mapItemInput(input),
        predictionId,
        promptText: input.text,
      },
    });

    return this.mapMutationPrompt(result.createPredictionPrompt);
  }

  async updatePrompt(
    promptId: PredictionPromptId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<PredictionPromptId>> {
    const result = await this.graphqlClient.request(UpdatePredictionPromptManagementDocument, {
      promptId,
      input: {
        ...this.mapper.mapItemInput(input),
        promptText: input.text,
      },
    });

    return this.mapMutationPrompt(result.updatePredictionPrompt);
  }

  async deletePrompt(promptId: PredictionPromptId): Promise<void> {
    await this.graphqlClient.request(DeletePredictionPromptManagementDocument, { promptId });
  }

  private mapMutationPrompt(
    prompt: GraphqlPredictionPrompt | null | undefined,
  ): PlayableManagementItem<PredictionPromptId> {
    if (!prompt) {
      throw new Error('Prediction prompt mutation did not return a prompt');
    }

    return this.mapper.mapItem({
      id: this.predictionPromptIdentifier.parse(prompt.id),
      gameTypeId: this.gameTypeIdentifier.parse(prompt.predictionId),
      position: prompt.position,
      text: prompt.promptText,
      timeLimit: prompt.timeLimit,
      points: prompt.points,
      options: prompt.options,
    });
  }

  private mapImportCreationResult(
    result:
      | CreatePredictionFromImportManagementMutation['createPredictionFromImport']
      | null
      | undefined,
  ): PlayableContentImportCreationResult {
    if (!result) {
      throw new Error('Prediction import creation did not return a prediction');
    }

    return {
      gameTypeId: this.gameTypeIdentifier.parse(result.predictionId),
      importedCount: result.promptCount,
    };
  }
}
