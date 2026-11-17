import type { GuideDefinition } from '../../domains/guide/ports/guide-tour.port';
export class GuideFixtureFactory {
  create(): GuideDefinition {
    return {
      id: 'dashboard-home',
      docPath: 'dashboard.md',
      steps: [
        {
          i18nKey: 'dashboard.guide.workspace',
          titleKey: 'dashboard.workspace.sectionTitle',
          anchor: 'workspace',
          route: '/workspace/dashboard',
          docAnchor: 'workspace',
        },
      ],
    };
  }
}
