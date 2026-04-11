import { describe, expect, it } from 'vitest';
import { PlayableManagementFixtureFactory } from '../../../../test-utils/fixtures/playable-management-fixture-factory';
import { PlayableManagementGraphqlMapper } from './playable-management-graphql.mapper';

describe('PlayableManagementGraphqlMapper', () => {
  const mapper = new PlayableManagementGraphqlMapper();
  const playableManagementFixtureFactory = new PlayableManagementFixtureFactory();

  it('preserves the provided item kind without imposing a shared kind contract', () => {
    expect(
      mapper.mapItem(
        playableManagementFixtureFactory.createItem({
          id: 12,
          gameTypeId: 8,
          kind: 'multiple',
          options: [],
        }),
      ).kind,
    ).toBe('multiple');
  });
});
