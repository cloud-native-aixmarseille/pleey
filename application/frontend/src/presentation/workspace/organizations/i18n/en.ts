export const organizationEn = {
  organization: {
    management: {
      header: {
        eyebrow: 'Organization',
        title: 'Manage organizations',
        subtitle: 'View details, statistics, and manage organizations and projects from one place.',
      },
      details: {
        created: 'Created {{date}}',
        empty: 'Select an organization to view its details.',
      },
      stats: {
        title: 'Key metrics',
        empty: 'Select an organization to see its metrics.',
        totalGames: 'Games',
        totalProjects: 'Projects',
        totalMembers: 'Members',
      },
      members: {
        title: 'Member management',
        empty: 'No members are attached to this organization yet.',
        addButton: 'Add member',
        removeButton: 'Remove',
        searchLabel: 'Search members',
        searchPlaceholder: 'Search by username',
        usernameOrEmailLabel: 'Username or email',
        usernameOrEmailPlaceholder: 'Enter a username or email',
        roleLabel: 'Role',
        roles: {
          owner: 'Owner',
          manager: 'Manager',
          member: 'Member',
        },
        removal: {
          confirm: 'Remove member',
          dialogTitle: 'Remove member',
          dialogMessage: 'Remove member #{{member}} from {{organization}}?',
        },
        validation: {
          usernameOrEmailRequired: 'Enter a username or email.',
        },
        pagination: {
          label: 'Member pages',
          previous: 'Previous member page',
          next: 'Next member page',
          pageOf: '{{current}} / {{total}}',
        },
      },
      create: {
        eyebrow: 'New organization',
        openButton: 'Create organization',
        title: 'Create organization',
        submit: 'Create organization',
        submitting: 'Creating...',
        success: 'Organization created successfully.',
        fields: {
          name: {
            label: 'Name',
            placeholder: 'Enter organization name',
          },
          description: {
            label: 'Description',
            placeholder: 'Describe the organization (optional)',
          },
        },
      },
      validation: {
        nameRequired: 'Organization name is required.',
      },
    },
    errors: {
      createFailed: 'Unable to create the organization.',
      loadFailed: 'Unable to load organizations.',
      memberAddFailed: 'Unable to add the organization member.',
      memberRemoveFailed: 'Unable to remove the organization member.',
      memberRoleUpdateFailed: 'Unable to update the organization member role.',
    },
  },
  project: {
    management: {
      searchLabel: 'Search projects',
      searchPlaceholder: 'Search projects',
      section: {
        eyebrow: 'Projects',
        title: 'Project management',
        createButton: 'Create project',
      },
      pagination: {
        label: 'Project pages',
        previous: 'Previous project page',
        next: 'Next project page',
        pageOf: '{{current}} / {{total}}',
      },
      list: {
        empty: 'No projects are attached to this organization yet.',
        descriptionFallback: 'No project description provided.',
        selectedBadge: 'Current project',
        editButton: 'Edit',
        removeButton: 'Remove',
      },
      form: {
        create: {
          eyebrow: 'New project',
          title: 'Create a project for {{organization}}',
          submit: 'Create project',
          submitting: 'Creating project...',
          success: 'Project created successfully.',
        },
        edit: {
          eyebrow: 'Update project',
          title: 'Edit project for {{organization}}',
          submit: 'Save changes',
          submitting: 'Saving changes...',
        },
        fields: {
          name: {
            label: 'Name',
            placeholder: 'Enter project name',
          },
          description: {
            label: 'Description',
            placeholder: 'Describe the project (optional)',
          },
        },
        fallbackOrganization: 'the selected organization',
      },
      removal: {
        confirm: 'Remove project',
        dialogTitle: 'Remove project',
        dialogMessage:
          'Remove {{project}} from this organization? Choose another project below before confirming so any existing games can be migrated safely.',
        migrationDescription:
          "Select the destination project that will receive this project's existing games before removal.",
        migrationLabel: 'Migrate games to',
        migrationPlaceholder: 'Select a migration project',
        submitting: 'Removing...',
      },
      validation: {
        nameRequired: 'Project name is required.',
      },
    },
    errors: {
      createFailed: 'Unable to create the project.',
      deleteFailed: 'Unable to remove the project.',
      loadFailed: 'Unable to load projects.',
      updateFailed: 'Unable to update the project.',
    },
  },
};
