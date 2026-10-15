import config from '../vitest.config.mts';

export default {
  ...config,
  test: {
    ...config.test,
    include: ['../../scripts/quiz-import-templates.spec.ts'],
  },
};
