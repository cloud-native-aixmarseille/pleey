import { inject, injectable } from 'inversify';
import {
  GuideCatalogToken,
  type GuideDefinition,
  type GuideTourPort,
  GuideTourPortToken,
} from '../../../domains/guide/ports/guide-tour.port';
import { type StoragePort, StoragePortToken } from '../../../domains/shared/ports/storage.port';

@injectable()
export class GuideTourFacade {
  constructor(
    @inject(GuideCatalogToken) private readonly guides: readonly GuideDefinition[],
    @inject(GuideTourPortToken) private readonly tour: GuideTourPort,
    @inject(StoragePortToken) private readonly storage: StoragePort,
  ) {}

  startTour(guideId: string, onComplete: () => void): boolean {
    const guide = this.guides.find((candidate) => candidate.id === guideId);
    if (!guide) return false;
    return this.tour.start(guide, () => {
      try {
        this.storage.setItem(`pleey_guide_completed:${guideId}`, 'true');
      } catch {
        /* Guidance remains usable when browser storage is unavailable. */
      }
      onComplete();
    });
  }

  isCompleted(guideId: string): boolean {
    try {
      return this.storage.getItem(`pleey_guide_completed:${guideId}`) === 'true';
    } catch {
      return false;
    }
  }

  stopTour(): void {
    this.tour.stop();
  }
}
