import { inject, injectable } from 'inversify';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { PredictionPromptIdentifier } from '../../../../application/game/types/prediction/services/prediction-prompt-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import type { PredictionPromptId } from '../../../../domains/game/types/prediction/entities/prediction-prompt-id';
import type { PredictionManagementRepository } from '../../../../domains/game/types/prediction/ports/prediction-management.repository';
import type { GameTypeId } from '../../../../domains/game/types/shared/game-type';
import type {
  PlayableContentImportInput,
  PlayableContentImportResult,
  PlayableGameMetadataInput,
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../domains/project/entities/project';
import { GraphqlClient } from '../../../graphql/client/graphql-client';
import {
  CreatePredictionManagementDocument,
  CreatePredictionPromptManagementDocument,
  type CreatePredictionPromptManagementMutation,
  DeletePredictionManagementDocument,
  DeletePredictionPromptManagementDocument,
  ImportPredictionPromptsManagementDocument,
  type ImportPredictionPromptsManagementMutation,
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
      input,
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

  async importPrompts(
    predictionId: GameTypeId,
    input: PlayableContentImportInput,
  ): Promise<PlayableContentImportResult> {
    const result = await this.graphqlClient.request(ImportPredictionPromptsManagementDocument, {
      input: {
        content: input.content,
        fileName: input.fileName,
        predictionId,
      },
    });

    return this.mapImportResult(result.importPredictionPrompts);
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

  private mapImportResult(
    result: ImportPredictionPromptsManagementMutation['importPredictionPrompts'] | null | undefined,
  ): PlayableContentImportResult {
    if (!result) {
      throw new Error('Prediction prompt import did not return a result');
    }

    return {
      importedCount: result.importedCount,
    };
  }
}
