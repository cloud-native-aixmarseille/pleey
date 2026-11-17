import type { GuideManifest } from '../../../../shared/guide/guide-manifest';

export const quizAuthoringGuide = {
  id: 'quiz-authoring',
  titleKey: 'game.types.quiz.title',
  docPath: 'quiz.md',
  steps: [
    {
      i18nKey: 'game.types.quiz.guide.authoring_tabs',
      titleKey: 'game.types.quiz.management.tabSetup',
      anchor: 'authoring-tabs',
      route: '/quizzes/:quizId',
      docAnchor: 'authoring-tabs',
    },
    {
      i18nKey: 'game.types.quiz.guide.authoring_list',
      titleKey: 'game.types.quiz.management.itemsTitle',
      anchor: 'authoring-list',
      route: '/quizzes/:quizId',
      docAnchor: 'authoring-list',
    },
    {
      i18nKey: 'game.types.quiz.guide.authoring_editor',
      titleKey: 'game.types.quiz.management.createItemTitle',
      anchor: 'authoring-editor',
      route: '/quizzes/:quizId',
      docAnchor: 'authoring-editor',
    },
  ],
} as const satisfies GuideManifest;
