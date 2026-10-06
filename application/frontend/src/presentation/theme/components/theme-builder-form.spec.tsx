import i18next from 'i18next';
import { sharedEn } from '../../shared/i18n/en';
import { themeEn } from '../i18n/en';

i18next.addResourceBundle('en', 'translation', sharedEn, true, true);
i18next.addResourceBundle('en', 'translation', themeEn, true, true);

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeManagementFacade } from '../../../application/workspace/themes/facades/theme-management.facade';
import { ThemeError, ThemeErrorCode } from '../../../domains/theme/errors/theme-error';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { renderThemeEditor as renderWithProviders } from '../../../test-utils/render-theme-editor';
import { ThemeBuilderForm } from './theme-builder-form';

const fixtures = new ThemeFixtureFactory();
describe('ThemeBuilderForm', () => {
  it('saves a renamed theme with its expected revision', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const onSaved = vi.fn();
    const save = vi.spyOn(ThemeManagementFacade.prototype, 'save').mockResolvedValue(theme);
    onTestFinished(() => save.mockRestore());
    renderWithProviders(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onSaved={onSaved} onCancel={vi.fn()} />,
    );
    // Act
    const name = await screen.findByLabelText('Theme name');
    fireEvent.change(name, { target: { value: 'Event branding' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }));
    // Assert
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        organizationId: theme.organizationId,
        themeId: theme.id,
        expectedRevision: theme.revision,
        document: { ...theme.document, name: 'Event branding' },
      }),
    );
    expect(onSaved).toHaveBeenCalledOnce();
  });
  it('keeps edits open and explains revision conflicts', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const onSaved = vi.fn();
    const save = vi
      .spyOn(ThemeManagementFacade.prototype, 'save')
      .mockRejectedValue(new ThemeError(ThemeErrorCode.REVISION_CONFLICT, {}));
    onTestFinished(() => save.mockRestore());
    renderWithProviders(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onSaved={onSaved} onCancel={vi.fn()} />,
    );
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Save theme' }));
    // Assert
    expect(
      await screen.findByText(
        'Someone updated this theme. Your edits are preserved. Save them as a new theme or reload the saved version.',
      ),
    ).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
  it('previews a managed logo after uploading it', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const user = userEvent.setup();
    const upload = vi.spyOn(ThemeManagementFacade.prototype, 'upload').mockResolvedValue({
      id: '01900000-0000-7000-8000-000000000002',
      url: '/api/theme-assets/01900000-0000-7000-8000-000000000002',
      width: 32,
      height: 32,
    });
    onTestFinished(() => upload.mockRestore());
    renderWithProviders(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Assets' }));
    await user.upload(screen.getByLabelText('Logo'), new File(['png'], 'logo.png', { type: 'image/png' }));
    // Assert
    await waitFor(() => expect(screen.getAllByRole('img', { name: 'Meetup logo' })).toHaveLength(1));
    expect(upload).toHaveBeenCalledWith(theme.organizationId, expect.any(File));
  });
  it('retries the selected image after an upload failure', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const file = new File(['png'], 'logo.png', { type: 'image/png' });
    const upload = vi
      .spyOn(ThemeManagementFacade.prototype, 'upload')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({
        id: '01900000-0000-7000-8000-000000000002',
        url: '/api/theme-assets/01900000-0000-7000-8000-000000000002',
        width: 32,
        height: 32,
      });
    onTestFinished(() => upload.mockRestore());
    renderWithProviders(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Assets' }));
    fireEvent.change(screen.getByLabelText('Logo'), { target: { files: [file] } });
    fireEvent.click(await screen.findByRole('button', { name: 'Retry upload' }));
    // Assert
    expect(await screen.findByRole('img', { name: 'Logo preview' })).toHaveAttribute(
      'src',
      '/api/theme-assets/01900000-0000-7000-8000-000000000002',
    );
    expect(upload).toHaveBeenNthCalledWith(2, theme.organizationId, file);
  });
  it('uses the upload decision independently and exposes its reason on the existing control', async ({
    onTestFinished,
  }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const permissions = { ...fixtures.createPermissions(), uploadAsset: fixtures.createPermissions(false).uploadAsset };
    const upload = vi.spyOn(ThemeManagementFacade.prototype, 'upload');
    onTestFinished(() => upload.mockRestore());
    renderWithProviders(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onSaved={vi.fn()} onCancel={vi.fn()} />,
      { permissions },
    );
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Assets' }));
    // Assert
    const logo = screen.getByRole('button', { name: 'Logo' });
    expect(logo).toBeDisabled();
    expect(logo).toHaveAccessibleDescription('Only organization owners and managers can manage themes.');
    expect(screen.getByRole('button', { name: 'Save theme' })).toBeEnabled();
    expect(upload).not.toHaveBeenCalled();
  });
});
