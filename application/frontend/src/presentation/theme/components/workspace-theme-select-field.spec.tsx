import { fireEvent, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import { ThemeManagementFacade } from '../../../application/workspace/themes/facades/theme-management.facade';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { renderWithProviders } from '../../../test-utils/render-with-providers';
import { sharedEn } from '../../shared/i18n/en';
import { themeEn } from '../i18n/en';
import { WorkspaceThemeSelectField } from './workspace-theme-select-field';

i18next.addResourceBundle('en', 'translation', sharedEn, true, true);
i18next.addResourceBundle('en', 'translation', themeEn, true, true);
describe('WorkspaceThemeSelectField', () => {
  it('loads an organization page on demand and selects its custom theme', async ({ onTestFinished }) => {
    // Arrange
    const theme = new ThemeFixtureFactory().createManagedTheme();
    const onChange = vi.fn();
    const list = vi
      .spyOn(ThemeManagementFacade.prototype, 'list')
      .mockResolvedValue({ items: [theme], totalCount: 11, overallCount: 11, page: 1, pageSize: 10, totalPages: 2 });
    onTestFinished(() => list.mockRestore());
    renderWithProviders(
      <WorkspaceThemeSelectField organizationId={theme.organizationId} id="theme" value={null} onChange={onChange} />,
    );
    expect(list).not.toHaveBeenCalled();
    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Browse organization themes' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Next theme page' }));
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(theme.organizationId, { page: 2, pageSize: 10, search: '' }),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Meetup' }));
    // Assert
    expect(onChange).toHaveBeenCalledWith(theme.id);
  });
});
