import { inject, injectable } from 'inversify';
import type { ReactNode } from 'react';
import { GuideTourFacade } from '../../../../application/guide/facades/guide-tour.facade';
import { provideGuide } from '../../../../presentation/shared/guide/guide-context';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';
@injectable()
export class AppGuideProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.GUIDE;
  constructor(@inject(GuideTourFacade) private readonly guide: GuideTourFacade) {
    super();
  }
  protected create(children: ReactNode): ReactNode {
    return provideGuide(children, this.guide);
  }
}
