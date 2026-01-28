export const authFr = {
  auth: {
    branding: {
      eyebrow: 'Pleey',
      title: 'Dynamisez vos événements avec des jeux live.',
      feature1: 'Quiz et pronostics en direct',
      feature2: 'Engagement du public en temps réel',
      feature3: 'Résultats et analyses instantanés',
    },
    form: {
      emailLabel: 'Email',
      emailPlaceholder: 'capitaine@pleey.io',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Votre mot de passe',
      usernameLabel: "Nom d'utilisateur",
      usernamePlaceholder: 'CapitaineArcade',
      validation: {
        emailRequired: 'L\u2019email est obligatoire.',

        passwordRequired: 'Le mot de passe est obligatoire.',
        usernameRequired: "Le nom d'utilisateur est obligatoire.",
      },
    },
    signIn: {
      eyebrow: 'Connexion',
      title: 'Bon retour.',
      subtitle: 'Connectez-vous \u00e0 votre compte Pleey pour continuer.',
      formLegend: 'Vos identifiants',
      formDescription:
        'Saisissez l\u2019email et le mot de passe associ\u00e9s \u00e0 votre compte Pleey.',
      submitCta: 'Se connecter',
      submittingCta: 'Connexion en cours\u2026',
      registerPrompt: "Vous n'avez pas de compte\u00a0?",
      registerLink: 'Cr\u00e9er un compte',
      forgotPasswordLink: 'Mot de passe oubli\u00e9\u00a0?',
      activeSession: {
        eyebrow: 'Session active',
        title: 'Bon retour, {{username}}.',
        description:
          'Vous \u00eates d\u00e9j\u00e0 connect\u00e9. Acc\u00e9dez au dashboard ou changez de compte.',
        dashboardCta: 'Aller au dashboard',
        signOutCta: 'Se d\u00e9connecter',
      },
      restoring: 'V\u00e9rification d\u2019une session existante\u2026',
    },
    register: {
      eyebrow: 'Cr\u00e9er un compte',
      title: 'Commencez avec Pleey.',
      subtitle: 'Cr\u00e9ez votre compte gratuit et animez vos premiers jeux en quelques minutes.',
      formLegend: 'D\u00e9tails du compte',
      formDescription:
        "Choisissez un nom d'utilisateur, saisissez votre email et cr\u00e9ez un mot de passe.",
      submitCta: 'Cr\u00e9er le compte',
      submittingCta: 'Cr\u00e9ation du compte\u2026',
      signInPrompt: 'Vous avez d\u00e9j\u00e0 un compte\u00a0?',
      signInLink: 'Se connecter',
      success: {
        title: 'Compte cr\u00e9\u00e9\u00a0!',
        message: 'Votre compte est pr\u00eat. Connectez-vous pour cr\u00e9er et animer vos jeux.',
        cta: 'Se connecter maintenant',
      },
    },
    forgotPassword: {
      eyebrow: 'R\u00e9initialiser',
      title: 'Mot de passe oubli\u00e9\u00a0?',
      subtitle:
        'Entrez votre email et nous vous enverrons les instructions pour le r\u00e9initialiser.',
      emailLabel: 'Adresse email',
      emailPlaceholder: 'capitaine@pleey.io',
      submitCta: 'Envoyer le lien',
      submittingCta: 'Envoi en cours\u2026',
      backToSignIn: 'Retour \u00e0 la connexion',
      success: {
        title: 'V\u00e9rifiez votre bo\u00eete mail.',
        message: 'Si un compte avec cet email existe, vous recevrez les instructions sous peu.',
        cta: 'Retour \u00e0 la connexion',
      },
    },
    profile: {
      eyebrow: 'Votre profil',
      title: 'Param\u00e8tres du compte',
      subtitle: 'Mettez \u00e0 jour vos informations et personnalisez votre compte.',
      avatarSection: {
        regenerateCta: 'G\u00e9n\u00e9rer un nouvel avatar',
        regeneratingCta: 'G\u00e9n\u00e9ration\u2026',
      },
      detailsSection: {
        legend: 'D\u00e9tails du profil',
        description: "Modifiez votre nom d'utilisateur ou votre adresse email.",
      },
      submitCta: 'Enregistrer',
      submittingCta: 'Enregistrement\u2026',
      successMessage: 'Profil mis \u00e0 jour avec succ\u00e8s.',
      signOutCta: 'Se d\u00e9connecter',
      signOutDescription: 'Terminer votre session en cours.',
    },
    errors: {
      invalidResponse: 'Une erreur est survenue. Veuillez r\u00e9essayer.',
      invalidCredentials: 'Email ou mot de passe invalide.',
      registrationFailed:
        'Impossible de cr\u00e9er le compte pour le moment. Veuillez r\u00e9essayer.',
      unauthorized: 'Votre session a expir\u00e9. Veuillez vous reconnecter.',
      invalidRefreshToken:
        'Votre session n\u2019a pas pu \u00eatre renouvel\u00e9e. Veuillez vous reconnecter.',
      refreshTokenExpired: 'Votre session a expir\u00e9. Veuillez vous reconnecter.',
      generic: 'Une erreur est survenue. Veuillez r\u00e9essayer.',
    },
  },
};
