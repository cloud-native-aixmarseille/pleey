export const gamePartyFr = {
  game: {
    party: {
      route: {
        invalidPin: 'Un pin de partie est requis pour ouvrir cette page.',
        loading: 'Chargement de l’observation du lobby...',
        statusBarLabel: 'Barre de statut du lobby de partie',
        statusTitle: 'Partie {{pin}}',
        playerCount: '{{count}} joueurs',
        runtimeStageProgress: 'Manche {{current}} sur {{total}}',
        pinAriaLabel: 'PIN de partie : {{pin}}',
        playerAvatarAlt: 'Avatar de {{username}}',
        playersLabel: 'Joueurs dans le lobby',
        playersTitle: 'Joueurs',
        emptyPlayers: 'Aucun joueur n’est encore connecté.',
        finalLeaderboardEmpty: 'Aucun score final n’est encore disponible.',
        finalLeaderboardScore: '{{points}} pts',
        finalSummaryLabel: 'Récapitulatif de fin de partie',
        finalSummaryEyebrow: 'Partie terminée',
        finalSummaryTitle: 'Partie terminée !',
        finalSummarySubtitleWithWinner:
          '{{username}} décroche la couronne. Bravo à toutes et tous pour ces moments mémorables.',
        finalSummarySubtitleNoWinner:
          'Aucun score n’a été enregistré pour cette partie. Relancez-la pour couronner un·e champion·ne.',
        finalSummaryPodiumTitle: 'Podium',
        finalSummaryPodiumHint: 'Les trois meilleur·e·s de cette partie.',
        finalSummaryStandingsTitle: 'Classement complet',
        finalSummaryAvatarAlt: 'Avatar de {{username}}',
        youBadge: 'Vous',
        dashboardCta: 'Retour au dashboard',
      },
      status: {
        waiting: 'En attente de joueurs',
        active: 'En direct',
        paused: 'En pause',
        ended: 'Terminée',
      },
      role: {
        player: 'Joueur',
      },
      errors: {
        playerAlreadyInActiveParty: 'Vous participez déjà à une autre partie active.',
        createFailed: 'Impossible de créer une partie pour le moment.',
        guestNameRequired: 'Un pseudo invité est requis avant de rejoindre.',
        joinFailed: 'Impossible de rejoindre cette partie pour le moment.',
        listFailed: 'Impossible de charger les parties pour le moment.',
        leaveFailed: 'Impossible de quitter cette partie pour le moment.',
        hostPartyControlForbidden: 'Seul l’hôte peut exécuter cette commande.',
        connectionLost:
          'La connexion temps réel de la partie a été interrompue. Reconnexion en cours.',
        observeFailed: 'Impossible d’observer cette partie pour le moment.',
        partyCommandNotAvailable: 'Cette commande hôte n’est pas disponible actuellement.',
        partyNotFound: 'Cette partie n’est plus disponible.',
        partyStagesNotAvailable: 'Cette partie ne contient encore aucune manche à démarrer.',
        validationFailed: 'La requête de partie est invalide.',
      },
    },
  },
};
