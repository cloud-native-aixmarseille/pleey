import 'reflect-metadata';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
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

describe('ThemeManagementRoute', () => {
  it.each(['', '/new', '/custom%3A01900000-0000-7000-8000-000000000001/edit'])(
    'denies direct management access to ordinary members at %s',
    async (suffix) => {
      // Arrange
      const theme = fixtures.createManagedTheme();
      const access = vi
        .spyOn(ThemeManagementFacade.prototype, 'permissions')
        .mockResolvedValue(fixtures.createPermissions(false));
      const get = vi.spyOn(ThemeManagementFacade.prototype, 'get');
      const list = vi.spyOn(ThemeManagementFacade.prototype, 'list');
      onTestFinished(() => {
        access.mockRestore();
        get.mockRestore();
        list.mockRestore();
      });
      renderWithProviders(<ThemeRoutesTestApp />, {
        initialPath: `/workspace/organizations/${theme.organizationId}/themes${suffix}`,
      });
      // Act
      const alert = await screen.findByRole('alert');
      // Assert
      expect(alert).toHaveTextContent('Only organization owners and managers can manage themes.');
      expect(screen.queryByRole('form')).not.toBeInTheDocument();
      expect(get).not.toHaveBeenCalled();
      expect(list).not.toHaveBeenCalled();
    },
  );
  it('preserves unsaved work and explains a denial after focus revalidation', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValueOnce(fixtures.createPermissions())
      .mockResolvedValue(fixtures.createPermissions(false));
    const save = vi.spyOn(ThemeManagementFacade.prototype, 'save');
    onTestFinished(() => {
      access.mockRestore();
      save.mockRestore();
    });
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/new`,
    });
    const name = await screen.findByLabelText('Theme name');
    fireEvent.change(name, { target: { value: 'Unsaved branding' } });
    // Act
    fireEvent(window, new Event('focus'));
    // Assert
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save theme' })).toBeDisabled());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save theme' })).toHaveAccessibleDescription(
        'Only organization owners and managers can manage themes.',
      ),
    );
    expect(screen.getByLabelText('Theme name')).toHaveValue('Unsaved branding');
    fireEvent.submit(screen.getByRole('form'));
    expect(save).not.toHaveBeenCalled();
  });

  it('refreshes permissions after a rejected save without losing the draft', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockResolvedValueOnce(fixtures.createPermissions())
      .mockResolvedValue(fixtures.createPermissions(false));
    const save = vi.spyOn(ThemeManagementFacade.prototype, 'save').mockRejectedValue(new Error('revoked'));
    onTestFinished(() => {
      access.mockRestore();
      save.mockRestore();
    });
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/new`,
    });
    fireEvent.change(await screen.findByLabelText('Theme name'), { target: { value: 'Keep these edits' } });
    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }));
    // Assert
    await waitFor(() => expect(access).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save theme' })).toHaveAccessibleDescription(
        'Only organization owners and managers can manage themes.',
      ),
    );
    expect(screen.getByLabelText('Theme name')).toHaveValue('Keep these edits');
  });

  it('never uses a previous organization grant while the new scope is loading', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const otherOrganization = '01900000-0000-7000-8000-000000000099';
    let resolveAccess: (value: ReturnType<ThemeFixtureFactory['createPermissions']>) => void = () => undefined;
    const pending = new Promise<ReturnType<ThemeFixtureFactory['createPermissions']>>((resolve) => {
      resolveAccess = resolve;
    });
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockImplementation((organizationId) =>
        organizationId === theme.organizationId ? Promise.resolve(fixtures.createPermissions()) : pending,
      );
    onTestFinished(() => access.mockRestore());
    const { router } = renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/new`,
    });
    await screen.findByRole('button', { name: 'Save theme' });
    // Act
    await act(() => router.navigate(`/workspace/organizations/${otherOrganization}/themes/new`));
    // Assert
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    await act(async () => resolveAccess(fixtures.createPermissions(false)));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Only organization owners and managers can manage themes.',
    );
  });
  it('offers retry after a failed access check without displaying the editor', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi
      .spyOn(ThemeManagementFacade.prototype, 'permissions')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(fixtures.createPermissions());
    onTestFinished(() => access.mockRestore());
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/new`,
    });
    // Act
    await screen.findByText('Theme management access could not be checked. Please retry.');
    // Assert
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(await screen.findByRole('button', { name: 'Save theme' })).toBeEnabled();
  });
});
