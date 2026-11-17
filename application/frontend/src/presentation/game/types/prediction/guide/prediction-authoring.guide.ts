import type { GuideManifest } from '../../../../shared/guide/guide-manifest';

export const predictionAuthoringGuide = {
  id: 'prediction-authoring',
  titleKey: 'game.types.prediction.title',
  docPath: 'prediction.md',
  steps: [
    {
      i18nKey: 'game.types.prediction.guide.authoring_tabs',
      titleKey: 'game.types.prediction.management.tabSetup',
      anchor: 'authoring-tabs',
      route: '/predictions/:predictionId',
      docAnchor: 'authoring-tabs',
    },
    {
      i18nKey: 'game.types.prediction.guide.authoring_list',
      titleKey: 'game.types.prediction.management.itemsTitle',
      anchor: 'authoring-list',
      route: '/predictions/:predictionId',
      docAnchor: 'authoring-list',
    },
    {
      i18nKey: 'game.types.prediction.guide.authoring_editor',
      titleKey: 'game.types.prediction.management.createItemTitle',
      anchor: 'authoring-editor',
      route: '/predictions/:predictionId',
      docAnchor: 'authoring-editor',
    },
  ],
} as const satisfies GuideManifest;
