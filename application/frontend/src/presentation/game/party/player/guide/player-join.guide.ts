import type { GuideManifest } from '../../../../shared/guide/guide-manifest';

export const playerJoinGuide = {
  id: 'player-join',
  titleKey: 'game.party.player.route.joinHeroEyebrow',
  docPath: 'player-join.md',
  steps: [
    {
      i18nKey: 'game.party.player.guide.join_identity',
      titleKey: 'game.party.player.route.joinPanelLabel',
      anchor: 'join-identity',
      route: '/join/:pin',
      docAnchor: 'join-identity',
    },
    {
      i18nKey: 'game.party.player.guide.join_submit',
      titleKey: 'game.party.player.route.joinHeroTitle',
      anchor: 'join-submit',
      route: '/join/:pin',
      docAnchor: 'join-submit',
    },
  ],
} as const satisfies GuideManifest;
