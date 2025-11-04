import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Sidebar configuration for QuizMaster documentation
 * Two main sections: Functional (user-facing) and Technical (developer-facing)
 */
const sidebars: SidebarsConfig = {
  // Functional documentation for end users
  functionalSidebar: [
    {
      type: 'category',
      label: '🎮 User Guide',
      items: [
        'functional/intro',
        'functional/quickstart',
        'functional/admin-host-guide',
      ],
    },
  ],

  // Technical documentation for developers, QA, and agents
  technicalSidebar: [
    {
      type: 'category',
      label: '🏗️ Architecture & Design',
      items: [
        'technical/architecture',
        'technical/design-system',
      ],
    },
    {
      type: 'category',
      label: '🛠️ Development',
      items: [
        'technical/docker-guide',
        'technical/testing',
        'technical/i18n',
        'technical/accessibility',
      ],
    },
    {
      type: 'category',
      label: '🚀 Deployment & Operations',
      items: [
        'technical/deployment',
        'technical/monitoring',
        'technical/security',
      ],
    },
    {
      type: 'category',
      label: '📖 Reference',
      items: [
        'technical/quick-reference',
      ],
    },
  ],
};

export default sidebars;
