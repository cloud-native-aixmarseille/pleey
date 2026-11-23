import type { GuideManifest } from '../../../shared/guide/guide-manifest';

export const dashboardHomeGuide = {
  id: 'dashboard-home',
  titleKey: 'dashboard.console.title',
  docPath: 'dashboard.md',
  steps: [
    {
      i18nKey: 'dashboard.guide.workspace',
      titleKey: 'dashboard.workspace.sectionTitle',
      anchor: 'workspace',
      route: '/workspace/dashboard',
      docAnchor: 'workspace',
    },
    {
      i18nKey: 'dashboard.guide.create_game',
      titleKey: 'dashboard.games.actions.createGame',
      anchor: 'create-game',
      route: '/workspace/dashboard',
      docAnchor: 'create-game',
    },
    {
      i18nKey: 'dashboard.guide.create_party',
      titleKey: 'dashboard.games.title',
      anchor: 'create-party',
      route: '/workspace/dashboard',
      docAnchor: 'create-party',
    },
    {
      i18nKey: 'dashboard.guide.launch',
      titleKey: 'dashboard.activeParty.title',
      anchor: 'launch',
      route: '/workspace/dashboard',
      docAnchor: 'launch',
    },
  ],
} as const satisfies GuideManifest;
