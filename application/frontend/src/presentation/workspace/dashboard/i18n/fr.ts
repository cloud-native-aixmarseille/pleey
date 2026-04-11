export const dashboardFr = {
  dashboard: {
    console: {
      title: 'Console d espace',
      subtitle:
        'Choisissez un espace, puis passez de la preparation au lancement sans quitter le tableau de bord.',
      commandPalette: {
        title: 'Palette de commandes',
        description:
          'Passez d une organisation a un projet ou a une action de jeu depuis un seul point d entree.',
        meta: 'Le chemin le plus rapide pour les operations repetitives',
      },
      fastFiltering: {
        title: 'Filtrage rapide',
        description: 'Reduisez les longues listes de jeux par type, nom et statut avant d agir.',
        meta: 'Pense pour les espaces charges',
      },
      liveOps: {
        title: 'Vue live ops',
        description:
          'Gardez les parties actives, la readiness des jeux et le lancement dans la meme surface.',
        meta: 'Le contexte reste lie au projet selectionne',
      },
    },
    workspace: {
      sectionTitle: 'Choisissez votre espace',
      organizationLabel: 'Organisation',
      organizationPlaceholder: 'Choisir une organisation',
      projectLabel: 'Projet',
      projectPlaceholder: 'Choisir un projet',
      manageOrganizations: 'Gérer les organisations',
      manageProjects: 'Gérer les projets',
    },
    stats: {
      title: 'Métriques clés',
      empty: 'Sélectionnez une organisation pour voir ses métriques.',
      totalGames: 'Jeux',
      totalProjects: 'Projets',
      totalMembers: 'Membres',
    },
    games: {
      title: 'Vos jeux',
      pending: 'Sélectionnez un projet pour voir ses jeux.',
      empty: 'Aucun jeu trouvé dans ce projet pour le moment.',
      noDescription: 'Aucune description fournie.',
      createdAt: 'Créé le {{date}}',
      readiness: {
        ready: '{{count}} stages prets',
        needsStages: 'Ajoutez des stages avant le lancement',
      },
      actions: {
        createGame: 'Créer un jeu',
        createParty: 'Créer une partie',
        manage: 'Gérer',
      },
      create: {
        title: 'Créer un nouveau jeu',
        typeLabel: 'Type de jeu',
        titleLabel: 'Titre',
        descriptionLabel: 'Description',
        submit: 'Créer le jeu',
        error: 'Impossible de créer le jeu.',
      },
      permissions: {
        createParty: {
          activePartyExists: 'Une partie active existe déjà pour ce jeu.',
          hostHasActiveParty: 'Vous hébergez déjà une autre partie active.',
          noStagesAvailable: 'Ajoutez au moins un stage avant de créer une partie pour ce jeu.',
        },
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
    activeParty: {
      title: 'Votre partie active',
      empty: 'Aucune partie active n’existe encore pour ce compte.',
      pinTitle: 'PIN de partie {{pin}}',
      role: {
        host: 'Hôte',
        player: 'Joueur',
      },
      actions: {
        openLobby: 'Ouvrir le lobby',
        openLive: 'Ouvrir la partie en direct',
      },
    },
    errors: {
      loadFailed: 'Impossible de charger les données demandées.',
    },
  },
  project: {
    errors: {
      loadFailed: 'Impossible de charger les projets.',
    },
  },
};
