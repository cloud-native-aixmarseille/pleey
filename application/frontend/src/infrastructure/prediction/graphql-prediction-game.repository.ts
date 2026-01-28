import { inject, injectable } from 'inversify';
import type { PredictionGame } from '../../domains/prediction/entities/prediction-game';
import type {
  CreatePredictionPromptInput,
  UpdatePredictionPromptInput,
} from '../../domains/prediction/entities/prediction-management-input';
import type { PredictionPrompt } from '../../domains/prediction/entities/prediction-prompt';
import { PredictionErrorCode } from '../../domains/prediction/errors/prediction-error-code';
import type { PredictionGameRepository } from '../../domains/prediction/ports/prediction-game-repository';
import { GraphqlClient } from '../graphql/client/graphql-client';
import {
  CreatePredictionPromptDocument,
  type CreatePredictionPromptMutation,
  type CreatePredictionPromptMutationVariables,
  DashboardPredictionGamesByProjectDocument,
  type DashboardPredictionGamesByProjectQuery,
  type DashboardPredictionGamesByProjectQueryVariables,
  DeletePredictionPromptDocument,
  type DeletePredictionPromptMutation,
  type DeletePredictionPromptMutationVariables,
  PredictionPromptsDocument,
  type PredictionPromptsQuery,
  type PredictionPromptsQueryVariables,
  UpdatePredictionPromptDocument,
  type UpdatePredictionPromptMutation,
  type UpdatePredictionPromptMutationVariables,
} from '../graphql/generated/graphql';

@injectable()
export class GraphqlPredictionGameRepository implements PredictionGameRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
  ) {}

  async getPredictionGamesByProject(projectId: number): Promise<PredictionGame[]> {
    try {
      const result = await this.graphqlClient.request<
        DashboardPredictionGamesByProjectQuery,
        DashboardPredictionGamesByProjectQueryVariables
      >(DashboardPredictionGamesByProjectDocument, { projectId });

      return (result.predictionGamesByProject ?? []).map((predictionGame) =>
        this.toPredictionGame(predictionGame),
      );
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, PredictionErrorCode.LOAD_FAILED));
    }
  }

  async getPredictionPrompts(predictionId: number): Promise<PredictionPrompt[]> {
    try {
      const result = await this.graphqlClient.request<
        PredictionPromptsQuery,
        PredictionPromptsQueryVariables
      >(PredictionPromptsDocument, { predictionId });

      return (result.predictionPrompts ?? []).map((prompt) => this.toPredictionPrompt(prompt));
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, PredictionErrorCode.PROMPT_LOAD_FAILED),
      );
    }
  }

  async createPredictionPrompt(input: CreatePredictionPromptInput): Promise<PredictionPrompt> {
    try {
      const result = await this.graphqlClient.request<
        CreatePredictionPromptMutation,
        CreatePredictionPromptMutationVariables
      >(CreatePredictionPromptDocument, {
        input: {
          predictionId: input.predictionId,
          position: input.position,
          promptText: input.promptText,
          options: input.options.map((option) => ({
            id: option.id,
            text: option.text,
            position: option.position,
            isCorrect: option.isCorrect,
          })),
          timeLimit: input.timeLimit,
          points: input.points,
        },
      });

      return this.toPredictionPrompt(result.createPredictionPrompt);
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, PredictionErrorCode.PROMPT_CREATE_FAILED),
      );
    }
  }

  async updatePredictionPrompt(
    promptId: number,
    input: UpdatePredictionPromptInput,
  ): Promise<PredictionPrompt> {
    try {
      const result = await this.graphqlClient.request<
        UpdatePredictionPromptMutation,
        UpdatePredictionPromptMutationVariables
      >(UpdatePredictionPromptDocument, {
        promptId,
        input: {
          predictionId: input.predictionId,
          position: input.position,
          promptText: input.promptText,
          options: input.options?.map((option) => ({
            id: option.id,
            text: option.text,
            position: option.position,
            isCorrect: option.isCorrect,
          })),
          timeLimit: input.timeLimit,
          points: input.points,
        },
      });

      return this.toPredictionPrompt(result.updatePredictionPrompt);
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, PredictionErrorCode.PROMPT_UPDATE_FAILED),
      );
    }
  }

  async deletePredictionPrompt(promptId: number): Promise<void> {
    try {
      await this.graphqlClient.request<
        DeletePredictionPromptMutation,
        DeletePredictionPromptMutationVariables
      >(DeletePredictionPromptDocument, { promptId });
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, PredictionErrorCode.PROMPT_DELETE_FAILED),
      );
    }
  }

  private toPredictionGame(predictionGame: {
    readonly id: number;
    readonly predictionId: number;
    readonly projectId: number;
    readonly title: string;
    readonly description?: string | null;
    readonly promptCount?: number;
    readonly createdAt: string;
  }): PredictionGame {
    return {
      id: predictionGame.id,
      predictionId: predictionGame.predictionId,
      projectId: predictionGame.projectId,
      title: predictionGame.title,
      description: predictionGame.description ?? null,
      promptCount: predictionGame.promptCount ?? 0,
      createdAt: predictionGame.createdAt,
    };
  }

  private toPredictionPrompt(prompt: {
    readonly id: number;
    readonly predictionId: number;
    readonly position: number;
    readonly promptText: string;
    readonly options: readonly {
      readonly id: number;
      readonly text?: string | null;
      readonly position: number;
      readonly isCorrect: boolean;
    }[];
    readonly timeLimit: number;
    readonly points: number;
  }): PredictionPrompt {
    return {
      id: prompt.id,
      predictionId: prompt.predictionId,
      position: prompt.position,
      promptText: prompt.promptText,
      options: prompt.options.map((option) => ({
        id: option.id,
        text: option.text ?? null,
        position: option.position,
        isCorrect: option.isCorrect,
      })),
      timeLimit: prompt.timeLimit,
      points: prompt.points,
    };
  }
}
