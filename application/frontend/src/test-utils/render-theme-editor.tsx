import type { ReactElement } from 'react';
import { vi } from 'vitest';
import type { ThemePermissions } from '../domains/theme/value-objects/theme-permissions';
import { ThemePermissionsContext } from '../presentation/theme/components/theme-permissions-context';
import { ThemeFixtureFactory } from './fixtures/theme-fixture-factory';
import { renderWithDataRouter } from './render-with-data-router';

export function renderThemeEditor(
  ui: ReactElement,
  {
    initialPath = '/',
    permissions = new ThemeFixtureFactory().createPermissions(),
    refresh = vi.fn(),
  }: { initialPath?: string; permissions?: ThemePermissions; refresh?: () => void } = {},
) {
  return renderWithDataRouter(
    <ThemePermissionsContext value={{ permissions, error: false, refresh }}>{ui}</ThemePermissionsContext>,
    { initialPath },
  );
}
