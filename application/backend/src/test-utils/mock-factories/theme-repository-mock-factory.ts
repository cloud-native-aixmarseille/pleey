import { vi } from 'vitest';
import type { ThemeRepository } from '../../domain/theme/ports/theme-repository';
export class ThemeRepositoryMockFactory {
  create() {
    return {
      findAccess: vi.fn<ThemeRepository['findAccess']>().mockResolvedValue({ canManage: true }),
      findPage: vi.fn<ThemeRepository['findPage']>(),
      findById: vi.fn<ThemeRepository['findById']>().mockResolvedValue(null),
      save: vi.fn<ThemeRepository['save']>(),
      assetBelongsToOrganization: vi.fn<ThemeRepository['assetBelongsToOrganization']>().mockResolvedValue(true),
      createAsset: vi.fn<ThemeRepository['createAsset']>(),
      findAsset: vi.fn<ThemeRepository['findAsset']>().mockResolvedValue(null),
    };
  }
}
