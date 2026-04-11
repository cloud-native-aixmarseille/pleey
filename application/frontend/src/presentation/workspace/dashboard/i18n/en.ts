export const dashboardEn = {
  dashboard: {
    console: {
      title: 'Workspace console',
      subtitle: 'Pick a workspace, then move from setup to launch without leaving the dashboard.',
      commandPalette: {
        title: 'Command palette',
        description: 'Jump between organizations, projects, and game actions from one place.',
        meta: 'Fastest path for repeat operators',
      },
      fastFiltering: {
        title: 'Fast filtering',
        description: 'Narrow large game lists by type, name, and status before taking action.',
        meta: 'Built for dense workspaces',
      },
      liveOps: {
        title: 'Live ops overview',
        description:
          'Keep active parties, game readiness, and launch control in the same working surface.',
        meta: 'Context stays local to the selected project',
      },
    },
    workspace: {
      sectionTitle: 'Choose your workspace',
      organizationLabel: 'Organization',
      organizationPlaceholder: 'Choose an organization',
      projectLabel: 'Project',
      projectPlaceholder: 'Choose a project',
      manageOrganizations: 'Manage organizations',
      manageProjects: 'Manage projects',
    },
    stats: {
      title: 'Key metrics',
      empty: 'Select an organization to see its metrics.',
      totalGames: 'Games',
      totalProjects: 'Projects',
      totalMembers: 'Members',
    },
    games: {
      title: 'Your games',
      pending: 'Select a project to see its games.',
      empty: 'No games found in this project yet.',
      noDescription: 'No description provided.',
      createdAt: 'Created {{date}}',
      readiness: {
        ready: '{{count}} stages ready',
        needsStages: 'Add stages before launch',
      },
      actions: {
        createGame: 'Create game',
        createParty: 'Create party',
        manage: 'Manage',
      },
      create: {
        title: 'Create a new game',
        typeLabel: 'Game type',
        titleLabel: 'Title',
        descriptionLabel: 'Description',
        submit: 'Create game',
        error: 'Unable to create the game.',
      },
      permissions: {
        createParty: {
          activePartyExists: 'An active party already exists for this game.',
          hostHasActiveParty: 'You already host another active party.',
          noStagesAvailable: 'Add at least one stage before creating a party for this game.',
        },
      },
      filters: {
        label: 'Filter games',
        searchPlaceholder: 'Search games...',
        typeLabel: 'Game type',
        allTypes: 'All types',
        sortLabel: 'Sort by',
        sortDate: 'Date',
        sortName: 'Name',
        showing: '{{count}} of {{total}}',
        noResults: 'No games match the current filters.',
      },
      pagination: {
        label: 'Game list pages',
        previous: 'Previous page',
        next: 'Next page',
        pageOf: '{{current}} / {{total}}',
      },
    },
    activeParty: {
      title: 'Your active party',
      empty: 'No active party exists for this account yet.',
      pinTitle: 'Party PIN {{pin}}',
      role: {
        host: 'Host',
        player: 'Player',
      },
      actions: {
        openLobby: 'Open lobby',
        openLive: 'Open live party',
      },
    },
    errors: {
      loadFailed: 'Unable to load the requested dashboard data.',
    },
  },
  project: {
    errors: {
      loadFailed: 'Unable to load projects.',
    },
  },
};
