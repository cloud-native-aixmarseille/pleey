import { ContainerModule } from 'inversify';
import { createElement } from 'react';
import {
  type PatienceAnimationRegistry,
  PatienceAnimationRegistryToken,
} from '../../../../presentation/shared/ui/patience/patience-animation-registry-context';
import { PatienceAnimationId } from '../../../../presentation/shared/ui/patience/types';
import { LemmingsPatienceAnimation } from '../../../../presentation/shared/ui/patience/variants/lemmings/lemmings-patience-animation';
import { LemmingsPatienceEngine } from '../../../../presentation/shared/ui/patience/variants/lemmings/lemmings-patience-engine';
import { LemmingsPlatformService } from '../../../../presentation/shared/ui/patience/variants/lemmings/lemmings-platform-service';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppPatienceProviderFactory } from './app-patience-provider-factory';

export const patienceContainerModule = new ContainerModule(({ bind }) => {
  bind(LemmingsPlatformService).toSelf().inSingletonScope();
  bind(LemmingsPatienceEngine).toSelf().inSingletonScope();
  bind(AppPatienceProviderFactory)
    .toDynamicValue(({ get }) => {
      return new AppPatienceProviderFactory(
        get<PatienceAnimationRegistry>(PatienceAnimationRegistryToken),
      );
    })
    .inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppPatienceProviderFactory);
  bind<PatienceAnimationRegistry>(PatienceAnimationRegistryToken)
    .toDynamicValue(({ get }) => {
      const lemmingsPatienceEngine = get(LemmingsPatienceEngine);

      return {
        [PatienceAnimationId.LEMMINGS]: ({ container }) =>
          createElement(LemmingsPatienceAnimation, {
            container,
            engine: lemmingsPatienceEngine,
          }),
      };
    })
    .inSingletonScope();
});
