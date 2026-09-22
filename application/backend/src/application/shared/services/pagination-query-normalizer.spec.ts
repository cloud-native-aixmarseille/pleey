import { describe, expect, it } from 'vitest';
import { PaginationQueryNormalizer } from './pagination-query-normalizer';

describe('PaginationQueryNormalizer', () => {
  it.each([
    [{}, { page: 1, pageSize: 9, skip: 0 }],
    [
      { page: 0, pageSize: -5 },
      { page: 1, pageSize: 1, skip: 0 },
    ],
    [
      { page: 2.9, pageSize: 3.9 },
      { page: 2, pageSize: 3, skip: 3 },
    ],
    [
      { page: 20000, pageSize: 1000 },
      { page: 10000, pageSize: 100, skip: 999900 },
    ],
    [
      { page: Number.NaN, pageSize: Number.POSITIVE_INFINITY },
      { page: 1, pageSize: 9, skip: 0 },
    ],
  ])('normalizes %j to a bounded database window', (input, expected) => {
    // Arrange
    const normalizer = new PaginationQueryNormalizer();
    // Act
    const result = normalizer.normalizeQuery(input);
    // Assert
    expect(result).toEqual({ ...expected, search: undefined });
  });

  it('trims search before repositories filter and count', () => {
    // Arrange
    const normalizer = new PaginationQueryNormalizer();
    // Act
    const result = normalizer.normalizeQuery({ search: '  quiz  ', page: 2, pageSize: 10 });
    // Assert
    expect(result).toEqual({ search: 'quiz', page: 2, pageSize: 10, skip: 10 });
  });

  it('preserves an out-of-range requested page and scoped counts', () => {
    // Arrange
    const normalizer = new PaginationQueryNormalizer();
    const query = normalizer.normalizePage(5, 10);
    // Act
    const result = normalizer.toPaginatedResult(query, [], 12, 50);
    // Assert
    expect(result).toEqual({ items: [], totalCount: 12, overallCount: 50, page: 5, pageSize: 10, totalPages: 2 });
  });

  it('keeps one empty page when no scoped records exist', () => {
    // Arrange
    const normalizer = new PaginationQueryNormalizer();
    const query = normalizer.normalizeQuery({ search: '   ' });
    // Act
    const result = normalizer.toPaginatedResult(query, [], 0);
    // Assert
    expect(result).toEqual({ items: [], totalCount: 0, overallCount: 0, page: 1, pageSize: 9, totalPages: 1 });
  });
});
