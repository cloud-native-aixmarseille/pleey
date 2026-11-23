import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ProjectGamesInput } from '../../../game/management/graphql/types/project-games-input';
import { UserGameHistoryInput } from '../../../identity/graphql/types/user-game-history-input';
import { ListOrganizationsInput } from '../../../organization/graphql/types/list-organizations-input';
import { PaginationInput } from './pagination-input';

describe('PaginationInput', () => {
  describe.each([PaginationInput, ProjectGamesInput, UserGameHistoryInput, ListOrganizationsInput])(
    '%s pagination validation',
    (Input) => {
      it.each([
        { page: 0 },
        { page: 10001 },
        { page: 1.5 },
        { page: null },
        { pageSize: 0 },
        { pageSize: 101 },
        { pageSize: 2.5 },
        { pageSize: null },
      ])('rejects %j at the transport boundary', (value) => {
        // Arrange
        const input = plainToInstance(Input, value);
        // Act
        const errors = validateSync(input);
        // Assert
        expect(errors.some((error) => error.property === 'page' || error.property === 'pageSize')).toBe(true);
      });

      it('accepts the documented maximum window', () => {
        // Arrange
        const input = plainToInstance(Input, { page: 10000, pageSize: 100 });
        // Act
        const errors = validateSync(input);
        // Assert
        expect(errors.filter((error) => error.property === 'page' || error.property === 'pageSize')).toEqual([]);
      });
    },
  );
});
