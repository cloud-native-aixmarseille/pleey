import { inject, injectable } from 'inversify';
import type { DashboardGameListItem } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import type {
  PlayableContentImportCreationInput,
  PlayableGameMetadataInput,
} from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';
import type { GameTypeContributor } from '../../shared/contracts/game-type-contributor';
import type { PlayableContentImportExampleProvider } from '../../shared/contracts/playable-content-import.gateway';
import { PredictionManagementFacade } from '../facades/prediction-management.facade';
import { PredictionContentImportExampleFactory } from './prediction-content-import-example-factory';

@injectable()
export class PredictionGameTypeContributor implements GameTypeContributor {
  constructor(
    @inject(PredictionManagementFacade)
    private readonly predictionManagementFacade: PredictionManagementFacade,
    @inject(PredictionContentImportExampleFactory)
    private readonly predictionContentImportExampleFactory: PredictionContentImportExampleFactory,
  ) {}

  readonly descriptor = {
    key: GameType.Prediction,
    badge: 'PR',
    iconKey: 'prediction',
    titleKey: 'game.types.prediction.title',
    descriptionKey: 'game.types.prediction.description',
    managementRoutePath: '/predictions',
  } as const;

  get importExampleProvider(): PlayableContentImportExampleProvider {
    return this.predictionContentImportExampleFactory;
  }

  createGame(projectId: ProjectId, input: PlayableGameMetadataInput) {
    return this.predictionManagementFacade.createGame(projectId, input);
  }

  createGameFromImport(projectId: ProjectId, input: PlayableContentImportCreationInput) {
    return this.predictionManagementFacade.createGameFromImport(projectId, input);
  }

  buildGameSummary(game: DashboardGameListItem) {
    return {
      translationKey: 'game.types.prediction.management.promptSummary',
      values: { count: String(game.stageCount) },
    } as const;
  }
}
