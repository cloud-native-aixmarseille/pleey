import { describe, expect, it, vi } from 'vitest';
import { DashboardReadGatewayMockFactory } from '../../../test-utils/factories/dashboard-read-gateway-mock-factory';
import { WorkspaceSelectionPortMockFactory } from '../../../test-utils/factories/workspace-selection-port-mock-factory';
import { ListPredictionPromptsUseCase } from './list-prediction-prompts-use-case';
import { LoadPredictionManagementDataUseCase } from './load-prediction-management-data-use-case';

describe('LoadPredictionManagementDataUseCase', () => {
  it('returns empty state when no project is selected', async () => {
    const dashboardReadFacade = new DashboardReadGatewayMockFactory().create();
    const workspaceSelection = new WorkspaceSelectionPortMockFactory().create(undefined, {
      organizationId: 2,
      projectId: null,
    });
    const listPredictionPromptsUseCase = {
      execute: vi.fn(),
    } as unknown as ListPredictionPromptsUseCase;
    const useCase = new LoadPredictionManagementDataUseCase(
      dashboardReadFacade as never,
      workspaceSelection,
      listPredictionPromptsUseCase,
    );

    await expect(useCase.execute({ predictionId: 17 })).resolves.toEqual({
      predictionGame: null,
      prompts: [],
    });
    expect(dashboardReadFacade.loadProjectGames).not.toHaveBeenCalled();
  });

  it('returns empty state when the selected project does not expose the prediction game', async () => {
    const dashboardReadFacade = new DashboardReadGatewayMockFactory().create({
      loadProjectGames: vi.fn().mockResolvedValue([]),
    });
    const workspaceSelection = new WorkspaceSelectionPortMockFactory().create(undefined, {
      organizationId: 2,
      projectId: 8,
    });
    const listPredictionPromptsUseCase = {
      execute: vi.fn(),
    } as unknown as ListPredictionPromptsUseCase;
    const useCase = new LoadPredictionManagementDataUseCase(
      dashboardReadFacade as never,
      workspaceSelection,
      listPredictionPromptsUseCase,
    );

    await expect(useCase.execute({ predictionId: 17 })).resolves.toEqual({
      predictionGame: null,
      prompts: [],
    });
    expect(dashboardReadFacade.loadProjectGames).toHaveBeenCalledWith(8);
    expect(listPredictionPromptsUseCase.execute).not.toHaveBeenCalled();
  });

  it('loads prompts once the project exposes the target prediction game', async () => {
    const predictionGame = { type: 'prediction', relatedGameId: 17 };
    const prompts = [{ id: 13, promptText: 'Where will revenue land?' }];
    const dashboardReadFacade = new DashboardReadGatewayMockFactory().create({
      loadProjectGames: vi.fn().mockResolvedValue([predictionGame]),
    });
    const workspaceSelection = new WorkspaceSelectionPortMockFactory().create(undefined, {
      organizationId: 2,
      projectId: 8,
    });
    const listPredictionPromptsUseCase = {
      execute: vi.fn().mockResolvedValue(prompts),
    } as unknown as ListPredictionPromptsUseCase;
    const useCase = new LoadPredictionManagementDataUseCase(
      dashboardReadFacade as never,
      workspaceSelection,
      listPredictionPromptsUseCase,
    );

    await expect(useCase.execute({ predictionId: 17 })).resolves.toEqual({
      predictionGame,
      prompts,
    });
    expect(listPredictionPromptsUseCase.execute).toHaveBeenCalledWith({ predictionId: 17 });
  });
});
