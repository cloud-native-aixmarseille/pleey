import { ContainerModule } from 'inversify';
import type { DashboardGameTypeFacade } from '../../../application/game-catalog/contracts/game-type-management-facade';
import type { GameTypeCatalogFacade } from '../../../application/game-catalog/contracts/game-type-module-facade';
import type { GameTypeLiveFacade } from '../../../application/game-catalog/contracts/live-game-type-facade';
import { PREDICTION_SERVICE_ID } from '../../../application/prediction-management/contracts/prediction-service-id';
import { PredictionCatalogFacade } from '../../../application/prediction-management/facades/prediction-catalog.facade';
import { PredictionManagementFacade } from '../../../application/prediction-management/facades/prediction-management.facade';
import { PredictionPromptManagementFacade } from '../../../application/prediction-management/facades/prediction-prompt-management.facade';
import { CreatePredictionPromptUseCase } from '../../../application/prediction-management/use-cases/create-prediction-prompt-use-case';
import { DeletePredictionPromptUseCase } from '../../../application/prediction-management/use-cases/delete-prediction-prompt-use-case';
import { ListPredictionPromptsUseCase } from '../../../application/prediction-management/use-cases/list-prediction-prompts-use-case';
import { ListProjectPredictionGamesUseCase } from '../../../application/prediction-management/use-cases/list-project-prediction-games-use-case';
import { LoadPredictionManagementDataUseCase } from '../../../application/prediction-management/use-cases/load-prediction-management-data-use-case';
import { UpdatePredictionPromptUseCase } from '../../../application/prediction-management/use-cases/update-prediction-prompt-use-case';
import type { RouteFactory } from '../../../application/shared/contracts/routing.port';
import { DASHBOARD_SERVICE_ID } from '../../../application/workspace/dashboard/contracts/dashboard-service-id';
import { PredictionPromptManagementService } from '../../../domains/prediction/services/prediction-prompt-management.service';
import { GraphqlPredictionGameRepository } from '../../../infrastructure/prediction/graphql-prediction-game.repository';
import { PredictionRoutesFactory } from '../../../presentation/prediction/routes/prediction-routes-factory';
import { PredictionLiveFacade } from '../../prediction-management/facades/prediction-live.facade';
import { TOKENS } from '../tokens';

export const predictionManagementModule = new ContainerModule(({ bind }) => {
  bind(ListProjectPredictionGamesUseCase).toSelf().inSingletonScope();
  bind(LoadPredictionManagementDataUseCase).toSelf().inSingletonScope();
  bind(ListPredictionPromptsUseCase).toSelf().inSingletonScope();
  bind(CreatePredictionPromptUseCase).toSelf().inSingletonScope();
  bind(UpdatePredictionPromptUseCase).toSelf().inSingletonScope();
  bind(DeletePredictionPromptUseCase).toSelf().inSingletonScope();
  bind(PredictionPromptManagementService).toSelf().inSingletonScope();
  bind(PredictionPromptManagementFacade).toSelf().inSingletonScope();
  bind(PredictionManagementFacade).toSelf().inSingletonScope();
  bind(PREDICTION_SERVICE_ID.predictionGameRepository)
    .to(GraphqlPredictionGameRepository)
    .inSingletonScope();
  bind(PredictionCatalogFacade).toSelf().inSingletonScope();
  bind<GameTypeCatalogFacade>(TOKENS.gameTypeCatalogFacade).toService(PredictionCatalogFacade);
  bind<DashboardGameTypeFacade>(DASHBOARD_SERVICE_ID.dashboardGameTypeFacade).toService(
    PredictionCatalogFacade,
  );
  bind(PredictionLiveFacade).toSelf().inSingletonScope();
  bind<GameTypeLiveFacade>(TOKENS.gameTypeLiveFacade).toService(PredictionLiveFacade);
  bind(PredictionRoutesFactory).toSelf().inSingletonScope();

  bind<RouteFactory>(TOKENS.routeFactory).toService(PredictionRoutesFactory);
});
