import { ContainerModule } from 'inversify';
import { type MediaAccessPort, MediaAccessPortToken } from '../../../../domains/media/ports/media-access.port';
import { AuthorizedMediaAccessAdapter } from '../../../../infrastructure/media/authorized-media-access.adapter';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppMediaProviderFactory } from './app-media-provider-factory';

export const mediaContainerModule = new ContainerModule(({ bind }) => {
  bind(AuthorizedMediaAccessAdapter).toSelf().inSingletonScope();
  bind<MediaAccessPort>(MediaAccessPortToken).toService(AuthorizedMediaAccessAdapter);
  bind(AppMediaProviderFactory).toSelf().inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppMediaProviderFactory);
});
