import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import { ThemeManagementFacade } from '../../../application/workspace/themes/facades/theme-management.facade';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { renderWithDataRouter as renderWithProviders } from '../../../test-utils/render-with-data-router';
import { sharedEn } from '../../shared/i18n/en';
import { themeEn } from '../i18n/en';
import { WorkspaceThemeSelectField } from './workspace-theme-select-field';

i18next.addResourceBundle('en', 'translation', sharedEn, true, true);
i18next.addResourceBundle('en', 'translation', themeEn, true, true);

function mockThemeList(theme = new ThemeFixtureFactory().createManagedTheme()) {
  return vi.spyOn(ThemeManagementFacade.prototype, 'list').mockResolvedValue({
    permissions: new ThemeFixtureFactory().createPermissions(),
    items: [theme],
    totalCount: 1,
    overallCount: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
}

describe('WorkspaceThemeSelectField', () => {
  it('loads organization themes on demand and selects one from the unified picker', async ({ onTestFinished }) => {
    // Arrange
    const user = userEvent.setup();
    const theme = new ThemeFixtureFactory().createManagedTheme();
    const onChange = vi.fn();
    const list = mockThemeList(theme);
    onTestFinished(() => list.mockRestore());
    renderWithProviders(
      <WorkspaceThemeSelectField organizationId={theme.organizationId} id="theme" value={null} onChange={onChange} />,
    );
    expect(list).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByLabelText('Event theme'));
    await user.type(screen.getByLabelText('Search themes'), 'Meet');
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(theme.organizationId, { page: 1, pageSize: 10, search: 'Meet' }),
    );
    await user.keyboard('{ArrowDown}{Enter}');

    // Assert
    expect(onChange).toHaveBeenCalledWith(theme.id);
  });

  it('resets to the inherited theme when the inherit option is chosen', async ({ onTestFinished }) => {
    // Arrange
    const user = userEvent.setup();
    const theme = new ThemeFixtureFactory().createManagedTheme();
    const onChange = vi.fn();
    const list = mockThemeList(theme);
    onTestFinished(() => list.mockRestore());
    renderWithProviders(
      <WorkspaceThemeSelectField organizationId={theme.organizationId} id="theme" value={null} onChange={onChange} />,
    );

    // Act
    await user.click(screen.getByLabelText('Event theme'));
    await waitFor(() => expect(list).toHaveBeenCalled());
    await user.keyboard('{ArrowDown}{ArrowUp}{Enter}');

    // Assert
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
