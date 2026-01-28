import { Container } from 'inversify';
import { coreModule } from './container-modules/core.module';
import { gameSessionHostModule } from './container-modules/game-session-live-host.module';
import { gameSessionPlayerModule } from './container-modules/game-session-live-player.module';
import { gameSessionSharedModule } from './container-modules/game-session-live-shared.module';
import { identityModule } from './container-modules/identity.module';
import { predictionManagementModule } from './container-modules/prediction-management.module';
import { quizManagementModule } from './container-modules/quiz-management.module';
import { workspaceModule } from './container-modules/workspace.module';
import { FrontendContainerFactory } from './frontend-container-factory';

export class RuntimeContainerBuilder {
  build(): Container {
    const container = new FrontendContainerFactory().create();
    container.loadSync(
      coreModule,
      identityModule,
      workspaceModule,
      quizManagementModule,
      predictionManagementModule,
      gameSessionSharedModule,
      gameSessionHostModule,
      gameSessionPlayerModule,
    );
    return container;
  }
}
