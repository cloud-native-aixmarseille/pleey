import { describe, expect, it } from 'vitest';
import { PlayableManagementFixtureFactory } from '../../../../test-utils/fixtures/playable-management-fixture-factory';
import { coerceUuidV7TestValue } from '../../../../test-utils/fixtures/uuid-v7-test-value';
import { PlayableManagementGraphqlMapper } from './playable-management-graphql.mapper';

describe('PlayableManagementGraphqlMapper', () => {
  const mapper = new PlayableManagementGraphqlMapper();
  const playableManagementFixtureFactory = new PlayableManagementFixtureFactory();

  it('preserves the provided item kind without imposing a shared kind contract', () => {
    expect(
      mapper.mapItem(
        playableManagementFixtureFactory.createItem({
          id: coerceUuidV7TestValue(12),
          gameTypeId: 8,
          kind: 'multiple',
          options: [],
        }),
      ).kind,
    ).toBe('multiple');
  });
});
