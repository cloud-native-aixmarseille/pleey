import 'reflect-metadata';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { ThemeManagementFacade } from '../../../application/workspace/themes/facades/theme-management.facade';
import { ThemeError, ThemeErrorCode } from '../../../domains/theme/errors/theme-error';
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

describe('ThemeEditScreen', () => {
  it('loads a bookmarked edit URL and keeps the editor open after saving', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValue(fixtures.createPermissions());
    const get = vi.spyOn(ThemeManagementFacade.prototype, 'get').mockResolvedValue(theme);
    const save = vi.spyOn(ThemeManagementFacade.prototype, 'save').mockResolvedValue(theme);
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
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/${encodeURIComponent(theme.id)}/edit`,
    });
    // Act
    const name = await screen.findByLabelText('Theme name');
    fireEvent.change(name, { target: { value: 'Updated brand' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }));
    // Assert
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(screen.getByRole('heading', { name: 'Theme Studio' })).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith(theme.organizationId, theme.id);
    expect(save).toHaveBeenCalledWith({
      organizationId: theme.organizationId,
      themeId: theme.id,
      expectedRevision: theme.revision,
      document: { ...theme.document, name: 'Updated brand' },
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows a missing-theme error for stale edit links', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValue(fixtures.createPermissions());
    const get = vi
      .spyOn(ThemeManagementFacade.prototype, 'get')
      .mockRejectedValue(new ThemeError(ThemeErrorCode.NOT_FOUND, { themeId: theme.id }));
    onTestFinished(() => {
      access.mockRestore();
      get.mockRestore();
    });
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/${encodeURIComponent(theme.id)}/edit`,
    });
    // Act
    const alert = await screen.findByRole('alert');
    // Assert
    expect(alert).toHaveTextContent('This theme could not be found.');
    expect(screen.getByRole('link', { name: 'Back to themes' })).toHaveAttribute(
      'href',
      `/workspace/organizations/${theme.organizationId}/themes`,
    );
    expect(screen.queryByLabelText('Theme name')).not.toBeInTheDocument();
  });

  it('retries a failed theme read without leaving its edit route', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValue(fixtures.createPermissions());
    const get = vi.spyOn(ThemeManagementFacade.prototype, 'get').mockRejectedValue(new Error('offline'));
    onTestFinished(() => {
      access.mockRestore();
      get.mockRestore();
    });
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/${encodeURIComponent(theme.id)}/edit`,
    });
    // Act
    const reload = await screen.findByRole('button', { name: 'Reload' });
    get.mockResolvedValue(theme);
    fireEvent.click(reload);
    // Assert
    expect(await screen.findByLabelText('Theme name')).toHaveValue('Meetup');
    expect(get).toHaveBeenLastCalledWith(theme.organizationId, theme.id);
  });
});
