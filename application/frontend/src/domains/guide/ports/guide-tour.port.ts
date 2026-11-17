interface GuideStep {
  readonly i18nKey: string;
  readonly titleKey: string;
  readonly anchor: string;
  readonly route: string;
  readonly docAnchor: string;
}

export interface GuideDefinition {
  readonly id: string;
  readonly docPath: string;
  readonly steps: readonly GuideStep[];
}

export interface GuideTourPort {
  start(guide: GuideDefinition, onComplete: () => void): boolean;
  stop(): void;
}

export const GuideTourPortToken = Symbol.for('GuideTourPort');
export const GuideCatalogToken = Symbol.for('GuideCatalog');
