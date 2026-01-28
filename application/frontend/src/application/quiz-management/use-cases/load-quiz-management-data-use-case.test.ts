import { describe, expect, it, vi } from 'vitest';
import { DashboardReadGatewayMockFactory } from '../../../test-utils/factories/dashboard-read-gateway-mock-factory';
import { WorkspaceSelectionPortMockFactory } from '../../../test-utils/factories/workspace-selection-port-mock-factory';
import { GetQuizByIdUseCase } from './get-quiz-by-id-use-case';
import { ListQuizQuestionsUseCase } from './list-quiz-questions-use-case';
import { LoadQuizManagementDataUseCase } from './load-quiz-management-data-use-case';

describe('LoadQuizManagementDataUseCase', () => {
  it('returns empty state when no project is selected', async () => {
    const dashboardReadFacade = new DashboardReadGatewayMockFactory().create();
    const workspaceSelection = new WorkspaceSelectionPortMockFactory().create(undefined, {
      organizationId: 2,
      projectId: null,
    });
    const getQuizByIdUseCase = { execute: vi.fn() } as unknown as GetQuizByIdUseCase;
    const listQuizQuestionsUseCase = { execute: vi.fn() } as unknown as ListQuizQuestionsUseCase;
    const useCase = new LoadQuizManagementDataUseCase(
      dashboardReadFacade as never,
      workspaceSelection,
      getQuizByIdUseCase,
      listQuizQuestionsUseCase,
    );

    await expect(useCase.execute({ quizId: 7 })).resolves.toEqual({
      quiz: null,
      questions: [],
    });
    expect(dashboardReadFacade.loadProjectGames).not.toHaveBeenCalled();
  });

  it('returns empty state when the selected project does not expose the quiz', async () => {
    const dashboardReadFacade = new DashboardReadGatewayMockFactory().create({
      loadProjectGames: vi.fn().mockResolvedValue([]),
    });
    const workspaceSelection = new WorkspaceSelectionPortMockFactory().create(undefined, {
      organizationId: 2,
      projectId: 8,
    });
    const getQuizByIdUseCase = { execute: vi.fn() } as unknown as GetQuizByIdUseCase;
    const listQuizQuestionsUseCase = { execute: vi.fn() } as unknown as ListQuizQuestionsUseCase;
    const useCase = new LoadQuizManagementDataUseCase(
      dashboardReadFacade as never,
      workspaceSelection,
      getQuizByIdUseCase,
      listQuizQuestionsUseCase,
    );

    await expect(useCase.execute({ quizId: 7 })).resolves.toEqual({
      quiz: null,
      questions: [],
    });
    expect(dashboardReadFacade.loadProjectGames).toHaveBeenCalledWith(8);
    expect(getQuizByIdUseCase.execute).not.toHaveBeenCalled();
  });

  it('loads quiz data once the project exposes the target quiz', async () => {
    const quiz = { id: 7, title: 'Quarterly quiz' };
    const questions = [{ id: 13, questionText: 'What is 2 + 2?' }];
    const dashboardReadFacade = new DashboardReadGatewayMockFactory().create({
      loadProjectGames: vi.fn().mockResolvedValue([{ type: 'quiz', relatedGameId: 7 }]),
    });
    const workspaceSelection = new WorkspaceSelectionPortMockFactory().create(undefined, {
      organizationId: 2,
      projectId: 8,
    });
    const getQuizByIdUseCase = {
      execute: vi.fn().mockResolvedValue(quiz),
    } as unknown as GetQuizByIdUseCase;
    const listQuizQuestionsUseCase = {
      execute: vi.fn().mockResolvedValue(questions),
    } as unknown as ListQuizQuestionsUseCase;
    const useCase = new LoadQuizManagementDataUseCase(
      dashboardReadFacade as never,
      workspaceSelection,
      getQuizByIdUseCase,
      listQuizQuestionsUseCase,
    );

    await expect(useCase.execute({ quizId: 7 })).resolves.toEqual({
      quiz,
      questions,
    });
    expect(getQuizByIdUseCase.execute).toHaveBeenCalledWith({ quizId: 7 });
    expect(listQuizQuestionsUseCase.execute).toHaveBeenCalledWith({ quizId: 7 });
  });
});
