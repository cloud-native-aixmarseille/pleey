import { describe, expect, it, vi } from 'vitest';
import { collectPaginatedItems } from './collect-paginated-items';

describe('collectPaginatedItems', () => {
  it('traverses every page and uses the server page size', async () => {
    // Arrange
    const first = { items: ['one'], page: 1, pageSize: 1, totalCount: 3, overallCount: 3, totalPages: 3 };
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce({ ...first, items: ['two'], page: 2 })
      .mockResolvedValueOnce({ ...first, items: ['three'], page: 3 });
    // Act
    const result = await collectPaginatedItems(first, loadPage);
    // Assert
    expect({ result, requests: loadPage.mock.calls }).toEqual({
      result: ['one', 'two', 'three'],
      requests: [[{ page: 2, pageSize: 1 }], [{ page: 3, pageSize: 1 }]],
    });
  });

  it('does not request another page for an empty collection', async () => {
    // Arrange
    const first = { items: [], page: 1, pageSize: 100, totalCount: 0, overallCount: 0, totalPages: 1 };
    const loadPage = vi.fn();
    // Act
    const result = await collectPaginatedItems(first, loadPage);
    // Assert
    expect({ result, requests: loadPage.mock.calls }).toEqual({ result: [], requests: [] });
  });

  it.each([
    { page: 1, pageSize: 1, items: ['repeated page'] },
    { page: 2, pageSize: 1, items: [] },
    { page: 2, pageSize: 2, items: ['changed window'] },
  ])('rejects an incomplete traversal: %j', async (next) => {
    // Arrange
    const first = { items: ['one'], page: 1, pageSize: 1, totalCount: 2, overallCount: 2, totalPages: 2 };
    const loadPage = vi.fn().mockResolvedValue({ ...first, ...next });
    // Act
    const result = collectPaginatedItems(first, loadPage);
    // Assert
    await expect(result).rejects.toThrow('INCOMPLETE_COLLECTION');
  });

  it('fails instead of truncating when the server page limit is reached', async () => {
    // Arrange
    const first = {
      items: ['last supported page'],
      page: 10000,
      pageSize: 100,
      totalCount: 1000001,
      overallCount: 1000001,
      totalPages: 10001,
    };
    const loadPage = vi.fn();
    // Act
    const result = collectPaginatedItems(first, loadPage);
    // Assert
    await expect(result).rejects.toThrow('INCOMPLETE_COLLECTION');
  });

  it('propagates a failed later request without returning partial content', async () => {
    // Arrange
    const first = { items: ['one'], page: 1, pageSize: 1, totalCount: 2, overallCount: 2, totalPages: 2 };
    const loadPage = vi.fn().mockRejectedValue(new Error('offline'));
    // Act
    const result = collectPaginatedItems(first, loadPage);
    // Assert
    await expect(result).rejects.toThrow('offline');
  });
});
