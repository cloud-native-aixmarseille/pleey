import type { GuideManifest } from '../../shared/guide/guide-manifest';

export const themeStudioGuide = {
  id: 'theme-studio',
  titleKey: 'theme.builder.title',
  docPath: 'themes.md',
  steps: [
    {
      i18nKey: 'theme.guide.theme_toolbar',
      titleKey: 'theme.studio.title',
      anchor: 'theme-toolbar',
      route: '/workspace/organizations/:organizationId/themes/new',
      docAnchor: 'theme-toolbar',
    },
    {
      i18nKey: 'theme.guide.theme_controls',
      titleKey: 'theme.studio.controls',
      anchor: 'theme-controls',
      route: '/workspace/organizations/:organizationId/themes/new',
      docAnchor: 'theme-controls',
    },
  ],
} as const satisfies GuideManifest;
