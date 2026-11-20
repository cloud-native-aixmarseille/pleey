import { ContainerModule } from 'inversify';
import { GuideTourFacade } from '../../../../application/guide/facades/guide-tour.facade';
import { GuideCatalogToken, GuideTourPortToken } from '../../../../domains/guide/ports/guide-tour.port';
import { GuideTourAdapter } from '../../../../infrastructure/ui/guide-tour.adapter';
import { hostPartyGuide } from '../../../../presentation/game/party/host/guide/host-party.guide';
import { playerJoinGuide } from '../../../../presentation/game/party/player/guide/player-join.guide';
import { playerPlayGuide } from '../../../../presentation/game/party/player/guide/player-play.guide';
import { predictionAuthoringGuide } from '../../../../presentation/game/types/prediction/guide/prediction-authoring.guide';
import { quizAuthoringGuide } from '../../../../presentation/game/types/quiz/guide/quiz-authoring.guide';
import { themeStudioGuide } from '../../../../presentation/theme/guide/theme-studio.guide';
import { dashboardHomeGuide } from '../../../../presentation/workspace/dashboard/guide/dashboard-home.guide';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppGuideProviderFactory } from './app-guide-provider-factory';
export const guideContainerModule = new ContainerModule(({ bind }) => {
  bind(GuideCatalogToken).toConstantValue([
    dashboardHomeGuide,
    hostPartyGuide,
    playerJoinGuide,
    playerPlayGuide,
    quizAuthoringGuide,
    predictionAuthoringGuide,
    themeStudioGuide,
  ]);
  bind(GuideTourAdapter).toSelf().inSingletonScope();
  bind(GuideTourPortToken).toService(GuideTourAdapter);
  bind(GuideTourFacade).toSelf().inSingletonScope();
  bind(AppGuideProviderFactory).toSelf().inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppGuideProviderFactory);
});
