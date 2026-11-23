import { vi } from 'vitest';
import type { ThemeSelectionService } from '../../application/workspace/themes/services/theme-selection-service';
import { ThemeFixtureFactory } from '../fixtures/theme-fixture-factory';
export class ThemeSelectionServiceMockFactory {
  create(): ThemeSelectionService {
    return {
      resolve: vi.fn().mockResolvedValue(new ThemeFixtureFactory().createDocument()),
    } as unknown as ThemeSelectionService;
  }
}
