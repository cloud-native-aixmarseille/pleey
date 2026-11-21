import 'reflect-metadata';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { ThemeManagementFacade } from '../../../application/workspace/themes/facades/theme-management.facade';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { renderWithDataRouter as renderWithProviders } from '../../../test-utils/render-with-data-router';
import { ThemeRoutesTestApp } from '../../../test-utils/theme-routes-test-app';
import { sharedEn } from '../../shared/i18n/en';
import { themeEn } from '../i18n/en';

i18next.addResourceBundle('en', 'translation', sharedEn, true, true);
i18next.addResourceBundle('en', 'translation', themeEn, true, true);

vi.mock('../../identity/contexts/auth-context', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useAuth: () => ({ hasRestoredSession: true, user: { id: 'signed-in-user' } }),
}));

const fixtures = new ThemeFixtureFactory();

describe('ThemeCreateScreen', () => {
  it('creates a theme from its own route without requiring a prior library visit', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValue(fixtures.createPermissions());
    const save = vi.spyOn(ThemeManagementFacade.prototype, 'save').mockResolvedValue(theme);
    const get = vi.spyOn(ThemeManagementFacade.prototype, 'get').mockResolvedValue(theme);
    const list = vi.spyOn(ThemeManagementFacade.prototype, 'list').mockResolvedValue({
      permissions: fixtures.createPermissions(),
      items: [theme],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      totalCount: 1,
      overallCount: 1,
    });
    onTestFinished(() => {
      access.mockRestore();
      get.mockRestore();
      save.mockRestore();
      list.mockRestore();
    });
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/new`,
    });
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Save theme' }));
    // Assert
    await waitFor(() => expect(screen.getByLabelText('Theme name')).toHaveValue('Meetup'));
    expect(screen.getByRole('heading', { name: 'Theme Studio' })).toBeInTheDocument();
    expect(save).toHaveBeenCalledWith({
      organizationId: theme.organizationId,
      themeId: undefined,
      expectedRevision: undefined,
      document: { schemaVersion: 1, baseThemeId: 'cyber-arcade', name: 'My theme', overrides: {} },
    });
  });

  it('opens the starter selected from an empty library', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValue(fixtures.createPermissions());
    onTestFinished(() => access.mockRestore());
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/new/solar-grid`,
    });
    // Act
    const starter = await screen.findByRole('button', { name: 'Solar Grid' });
    // Assert
    expect(starter).toHaveAttribute('aria-pressed', 'true');
  });

  it('cancels creation by navigating back without saving', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValue(fixtures.createPermissions());
    const save = vi.spyOn(ThemeManagementFacade.prototype, 'save');
    const list = vi.spyOn(ThemeManagementFacade.prototype, 'list').mockResolvedValue({
      permissions: fixtures.createPermissions(),
      items: [],
      page: 1,
      pageSize: 10,
      totalPages: 0,
      totalCount: 0,
      overallCount: 0,
    });
    onTestFinished(() => {
      access.mockRestore();
      save.mockRestore();
      list.mockRestore();
    });
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/new`,
    });
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Back to themes' }));
    // Assert
    expect(await screen.findByText('No saved themes.')).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });
});
