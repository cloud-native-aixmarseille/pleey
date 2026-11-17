import type { GuideManifest } from '../../../../shared/guide/guide-manifest';

export const playerPlayGuide = {
  id: 'player-play',
  titleKey: 'game.party.role.player',
  docPath: 'player-play.md',
  steps: [
    {
      i18nKey: 'game.party.player.guide.player_lobby',
      titleKey: 'game.party.player.route.joinHeroTitle',
      anchor: 'player-lobby',
      route: '/party/:partyId/lobby',
      docAnchor: 'player-lobby',
    },
    {
      i18nKey: 'game.party.player.guide.player_scoring',
      titleKey: 'game.party.route.playersTitle',
      anchor: 'player-scoring',
      route: '/party/:partyId/lobby',
      docAnchor: 'player-scoring',
    },
  ],
} as const satisfies GuideManifest;
