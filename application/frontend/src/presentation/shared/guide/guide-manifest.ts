import type { GuideDefinition } from '../../../domains/guide/ports/guide-tour.port';

/** Ordered, localized guidance shared by the tour, reference generator and browser checks. */
export interface GuideManifest extends GuideDefinition {
  readonly titleKey: string;
}
