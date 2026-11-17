import type { GuideManifest } from '../../../../shared/guide/guide-manifest';

export const hostPartyGuide = {
  id: 'host-party',
  titleKey: 'game.party.host.route.hostingBadge',
  docPath: 'host-party.md',
  steps: [
    {
      i18nKey: 'game.party.host.guide.host_controls',
      titleKey: 'game.party.host.route.startPartyCta',
      anchor: 'host-controls',
      route: '/party/:partyId/lobby',
      docAnchor: 'host-controls',
    },
    {
      i18nKey: 'game.party.host.guide.host_share',
      titleKey: 'game.party.host.route.sharePanelLabel',
      anchor: 'host-share',
      route: '/party/:partyId/lobby',
      docAnchor: 'host-share',
    },
    {
      i18nKey: 'game.party.host.guide.host_players',
      titleKey: 'game.party.route.playersTitle',
      anchor: 'host-players',
      route: '/party/:partyId/lobby',
      docAnchor: 'host-players',
    },
  ],
} as const satisfies GuideManifest;
