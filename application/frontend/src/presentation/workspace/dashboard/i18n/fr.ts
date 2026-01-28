export const dashboardFr = {
  dashboard: {
    workspace: {
      sectionTitle: 'Choisissez votre espace',
      organizationLabel: 'Organisation',
      organizationPlaceholder: 'Choisir une organisation',
      projectLabel: 'Projet',
      projectPlaceholder: 'Choisir un projet',
      ready: 'Prêt sur {{organization}} / {{project}}.',
      manageOrganizations: 'Gérer les organisations',
      manageProjects: 'Gérer les projets',
    },
    stats: {
      title: 'Métriques clés',
      empty: 'Sélectionnez une organisation pour voir ses métriques.',
      totalGames: 'Jeux',
      totalProjects: 'Projets',
      totalMembers: 'Membres',
      activeGameSessions: 'Sessions actives',
      totalGameSessions: 'Sessions totales',
    },
    sessions: {
      title: 'Session active',
      fallbackTitle: 'Session {{pin}}',
      pin: 'PIN {{pin}}',
      actionFailed: 'Impossible de mettre à jour la session sélectionnée.',
      createFailed: 'Impossible de créer une nouvelle session de jeu.',
      status: {
        waiting: 'Lobby ouvert',
        active: 'En direct',
        paused: 'En pause',
      },
      role: {
        player: 'Joueur',
      },
      actions: {
        openLobby: 'Ouvrir le lobby',
        openLive: 'Ouvrir la vue live',
        leave: 'Quitter',
        pause: 'Mettre en pause',
        resume: 'Reprendre',
        leaving: 'Déconnexion...',
        stopping: 'Mise en pause...',
        resuming: 'Reprise...',
      },
    },
    games: {
      title: 'Vos jeux',
      pending: 'Sélectionnez un projet pour voir ses jeux.',
      empty: 'Aucun jeu trouvé dans ce projet pour le moment.',
      noDescription: 'Aucune description fournie.',
      createdAt: 'Créé le {{date}}',
      actions: {
        launch: 'Lancer',
        launching: 'Lancement...',
        launchDisabledActiveSession:
          "Une session est déjà active. Terminez-la avant d'en lancer une nouvelle.",
        manage: 'Gérer',
      },
      filters: {
        label: 'Filtrer les jeux',
        searchPlaceholder: 'Rechercher des jeux...',
        typeLabel: 'Type de jeu',
        allTypes: 'Tous les types',
        sortLabel: 'Trier par',
        sortDate: 'Date',
        sortName: 'Nom',
        showing: '{{count}} sur {{total}}',
        noResults: 'Aucun jeu ne correspond aux filtres actuels.',
      },
      pagination: {
        label: 'Pages de la liste de jeux',
        previous: 'Page précédente',
        next: 'Page suivante',
        pageOf: '{{current}} / {{total}}',
      },
    },
    errors: {
      loadFailed: 'Impossible de charger les données demandées.',
    },
  },
  project: {
    errors: {
      invalidResponse: 'Le serveur a renvoyé une réponse de projet invalide.',
      loadFailed: 'Impossible de charger les projets.',
    },
  },
};
