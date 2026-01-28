import { describe, expect, it } from 'vitest';
import { GraphqlDashboardGameRepository } from './graphql-dashboard-game.repository';

describe('GraphqlDashboardGameRepository', () => {
  it('exports the repository runtime', () => {
    expect(GraphqlDashboardGameRepository).toBeDefined();
  });
});
