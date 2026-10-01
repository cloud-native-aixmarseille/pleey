import { inject, injectable } from 'inversify';
import type { ReactNode } from 'react';
import { type MediaAccessPort, MediaAccessPortToken } from '../../../../domains/media/ports/media-access.port';
import { provideMediaAccess } from '../../../../presentation/shared/media/media-access-context';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

@injectable()
export class AppMediaProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.MEDIA;
  constructor(@inject(MediaAccessPortToken) private readonly access: MediaAccessPort) {
    super();
  }
  protected create(children: ReactNode): ReactNode {
    return provideMediaAccess(children, this.access);
  }
}
