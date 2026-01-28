export const dashboardEn = {
  dashboard: {
    workspace: {
      sectionTitle: 'Choose your workspace',
      organizationLabel: 'Organization',
      organizationPlaceholder: 'Choose an organization',
      projectLabel: 'Project',
      projectPlaceholder: 'Choose a project',
      ready: 'Ready in {{organization}} / {{project}}.',
      manageOrganizations: 'Manage organizations',
      manageProjects: 'Manage projects',
    },
    stats: {
      title: 'Key metrics',
      empty: 'Select an organization to see its metrics.',
      totalGames: 'Games',
      totalProjects: 'Projects',
      totalMembers: 'Members',
      activeGameSessions: 'Active sessions',
      totalGameSessions: 'Total sessions',
    },
    sessions: {
      title: 'Active session',
      fallbackTitle: 'Session {{pin}}',
      pin: 'PIN {{pin}}',
      actionFailed: 'Unable to update the selected session.',
      createFailed: 'Unable to create a new game session.',
      status: {
        waiting: 'Lobby open',
        active: 'Live',
        paused: 'Paused',
      },
      role: {
        player: 'Playing',
      },
      actions: {
        openLobby: 'Open lobby',
        openLive: 'Open live view',
        leave: 'Leave',
        pause: 'Pause',
        resume: 'Resume',
        leaving: 'Leaving...',
        stopping: 'Pausing...',
        resuming: 'Resuming...',
      },
    },
    games: {
      title: 'Your games',
      pending: 'Select a project to see its games.',
      empty: 'No games found in this project yet.',
      noDescription: 'No description provided.',
      createdAt: 'Created {{date}}',
      actions: {
        launch: 'Launch',
        launching: 'Launching...',
        launchDisabledActiveSession:
          'A session is already active. End it before launching a new one.',
        manage: 'Manage',
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
    errors: {
      loadFailed: 'Unable to load the requested dashboard data.',
    },
  },
  project: {
    errors: {
      invalidResponse: 'The server returned an invalid project payload.',
      loadFailed: 'Unable to load projects.',
    },
  },
};
