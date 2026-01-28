import { inject, injectable } from 'inversify';
import type { Quiz } from '../../../domains/quiz/entities/quiz';
import type { QuizQuestion } from '../../../domains/quiz/entities/quiz-question';
import {
  WORKSPACE_SELECTION_PORT,
  type WorkspaceSelectionPort,
} from '../../workspace/contracts/workspace-selection.port';
import { DashboardReadFacade } from '../../workspace/dashboard/facades/dashboard-read.facade';
import { GetQuizByIdUseCase } from './get-quiz-by-id-use-case';
import { ListQuizQuestionsUseCase } from './list-quiz-questions-use-case';

interface QuizManagementData {
  readonly quiz: Quiz | null;
  readonly questions: QuizQuestion[];
}

interface LoadQuizManagementDataCommand {
  readonly quizId: number;
}

@injectable()
export class LoadQuizManagementDataUseCase {
  constructor(
    @inject(DashboardReadFacade)
    private readonly dashboardReadFacade: DashboardReadFacade,
    @inject(WORKSPACE_SELECTION_PORT)
    private readonly workspaceSelection: WorkspaceSelectionPort,
    @inject(GetQuizByIdUseCase)
    private readonly getQuizByIdUseCase: GetQuizByIdUseCase,
    @inject(ListQuizQuestionsUseCase)
    private readonly listQuizQuestionsUseCase: ListQuizQuestionsUseCase,
  ) {}

  async execute(command: LoadQuizManagementDataCommand): Promise<QuizManagementData> {
    const selection = this.workspaceSelection.restoreSelection();

    if (selection.projectId === null) {
      return {
        quiz: null,
        questions: [],
      };
    }

    const projectGames = await this.dashboardReadFacade.loadProjectGames(selection.projectId);
    const selectedGame = projectGames.find(
      (candidate) => candidate.type === 'quiz' && candidate.relatedGameId === command.quizId,
    );

    if (!selectedGame) {
      return {
        quiz: null,
        questions: [],
      };
    }

    const [quiz, questions] = await Promise.all([
      this.getQuizByIdUseCase.execute({ quizId: command.quizId }),
      this.listQuizQuestionsUseCase.execute({ quizId: command.quizId }),
    ]);

    if (!quiz) {
      return {
        quiz: null,
        questions: [],
      };
    }

    return {
      quiz,
      questions,
    };
  }
}
