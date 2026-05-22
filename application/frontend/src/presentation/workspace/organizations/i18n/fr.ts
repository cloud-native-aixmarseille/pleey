export const organizationFr = {
  organization: {
    management: {
      header: {
        eyebrow: 'Organisation',
        title: 'Gérer les organisations',
        subtitle:
          'Consultez les détails, statistiques et gérez les organisations et projets depuis un seul écran.',
      },
      details: {
        created: 'Créé le {{date}}',
        empty: 'Sélectionnez une organisation pour afficher ses détails.',
      },
      stats: {
        title: 'Métriques clés',
        empty: 'Sélectionnez une organisation pour voir ses métriques.',
        totalGames: 'Jeux',
        totalProjects: 'Projets',
        totalMembers: 'Membres',
      },
      create: {
        eyebrow: 'Nouvelle organisation',
        openButton: 'Créer une organisation',
        title: 'Créer une organisation',
        submit: "Créer l'organisation",
        submitting: 'Création en cours...',
        fields: {
          name: {
            label: 'Nom',
            placeholder: "Nom de l'organisation",
          },
          description: {
            label: 'Description',
            placeholder: "Décrivez l'organisation (optionnel)",
          },
        },
      },
      validation: {
        nameRequired: "Le nom de l'organisation est requis.",
      },
    },
    errors: {
      createFailed: "Impossible de créer l'organisation.",
      loadFailed: 'Impossible de charger les organisations.',
    },
  },
  project: {
    management: {
      section: {
        eyebrow: 'Projets',
        title: 'Gestion des projets',
        createButton: 'Créer un projet',
      },
      list: {
        empty: "Aucun projet n'est encore rattaché à cette organisation.",
        descriptionFallback: 'Aucune description de projet fournie.',
        selectedBadge: 'Projet actif',
        editButton: 'Modifier',
        removeButton: 'Supprimer',
      },
      form: {
        create: {
          eyebrow: 'Nouveau projet',
          title: 'Créer un projet pour {{organization}}',
          submit: 'Créer le projet',
          submitting: 'Création du projet...',
        },
        edit: {
          eyebrow: 'Mettre à jour le projet',
          title: 'Modifier le projet de {{organization}}',
          submit: 'Enregistrer',
          submitting: 'Enregistrement...',
        },
        fields: {
          name: {
            label: 'Nom',
            placeholder: 'Nom du projet',
          },
          description: {
            label: 'Description',
            placeholder: 'Décrivez le projet (optionnel)',
          },
        },
        fallbackOrganization: "l'organisation sélectionnée",
      },
      removal: {
        confirm: 'Supprimer le projet',
        dialogTitle: 'Supprimer le projet',
        dialogMessage:
          'Supprimer {{project}} de cette organisation ? Choisissez un autre projet ci-dessous avant de confirmer afin de migrer en toute sécurité les jeux existants.',
        migrationDescription:
          'Sélectionnez le projet de destination qui recevra les jeux existants avant la suppression.',
        migrationLabel: 'Migrer les jeux vers',
        migrationPlaceholder: 'Sélectionnez un projet de migration',
        submitting: 'Suppression...',
      },
      validation: {
        nameRequired: 'Le nom du projet est requis.',
      },
    },
    errors: {
      createFailed: 'Impossible de créer le projet.',
      deleteFailed: 'Impossible de supprimer le projet.',
      loadFailed: 'Impossible de charger les projets.',
      updateFailed: 'Impossible de mettre à jour le projet.',
    },
  },
};
