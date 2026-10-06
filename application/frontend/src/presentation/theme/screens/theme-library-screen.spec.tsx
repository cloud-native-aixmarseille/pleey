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

describe('ThemeLibraryScreen', () => {
  it('links the paginated library to dedicated create and edit pages', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValue(fixtures.createPermissions());
    const list = vi.spyOn(ThemeManagementFacade.prototype, 'list').mockResolvedValue({
      permissions: fixtures.createPermissions(),
      items: [theme],
      page: 1,
      pageSize: 10,
      totalPages: 2,
      totalCount: 11,
      overallCount: 11,
    });
    onTestFinished(() => {
      access.mockRestore();
      list.mockRestore();
    });
    const path = `/workspace/organizations/${theme.organizationId}/themes`;
    renderWithProviders(<ThemeRoutesTestApp />, { initialPath: path });
    // Act
    const editLink = await screen.findByRole('link', { name: 'Edit Meetup' });
    // Assert
    expect(editLink).toHaveAttribute('href', `${path}/${encodeURIComponent(theme.id)}/edit`);
    expect(screen.getByRole('link', { name: 'Create theme' })).toHaveAttribute('href', `${path}/new`);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(list).toHaveBeenCalledWith(theme.organizationId, { page: 1, pageSize: 10, search: '' });
  });

  it('loads later library pages and resets the page when searching', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValue(fixtures.createPermissions());
    const list = vi.spyOn(ThemeManagementFacade.prototype, 'list').mockResolvedValue({
      permissions: fixtures.createPermissions(),
      items: [theme],
      page: 1,
      pageSize: 10,
      totalPages: 2,
      totalCount: 11,
      overallCount: 11,
    });
    onTestFinished(() => {
      access.mockRestore();
      list.mockRestore();
    });
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes`,
    });
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Next theme page' }));
    await screen.findByText('Page 2 of 2');
    fireEvent.change(screen.getByLabelText('Search themes'), { target: { value: 'Meetup' } });
    // Assert
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(theme.organizationId, { page: 1, pageSize: 10, search: 'Meetup' }),
    );
    expect(list).toHaveBeenCalledWith(theme.organizationId, { page: 2, pageSize: 10, search: '' });
  });
  it('uses fresh collection denials for visible create and edit actions', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValue(fixtures.createPermissions());
    const list = vi.spyOn(ThemeManagementFacade.prototype, 'list').mockResolvedValue({
      permissions: fixtures.createPermissions(false),
      items: [theme],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      totalCount: 1,
      overallCount: 1,
    });
    onTestFinished(() => {
      access.mockRestore();
      list.mockRestore();
    });
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes`,
    });
    // Act
    const edit = await screen.findByRole('button', { name: 'Edit Meetup' });
    // Assert
    expect(edit).toBeDisabled();
    expect(edit).toHaveAccessibleDescription('Only organization owners and managers can manage themes.');
    expect(screen.getByRole('button', { name: 'Create theme' })).toBeDisabled();
    expect(screen.queryByRole('link', { name: 'Create theme' })).not.toBeInTheDocument();
  });
});
