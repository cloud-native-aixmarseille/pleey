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
import { renderWithProviders } from '../../../test-utils/render-with-providers';
import { ThemeBuilderDialog } from './theme-builder-dialog';

const fixtures = new ThemeFixtureFactory();
describe('ThemeBuilderDialog', () => {
  it('saves a renamed theme with its expected revision', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const onSaved = vi.fn();
    const user = userEvent.setup();
    const save = vi.spyOn(ThemeManagementFacade.prototype, 'save').mockResolvedValue(theme);
    onTestFinished(() => save.mockRestore());
    renderWithProviders(
      <ThemeBuilderDialog organizationId={theme.organizationId} theme={theme} onSaved={onSaved} onClose={vi.fn()} />,
    );
    // Act
    const name = await screen.findByLabelText('Theme name');
    await user.clear(name);
    await user.type(name, 'Event branding');
    await user.click(screen.getByRole('button', { name: 'Save theme' }));
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
      <ThemeBuilderDialog organizationId={theme.organizationId} theme={theme} onSaved={onSaved} onClose={vi.fn()} />,
    );
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Save theme' }));
    // Assert
    expect(
      await screen.findByText('Someone updated this theme. Close and reopen it before saving again.'),
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
      <ThemeBuilderDialog organizationId={theme.organizationId} theme={theme} onSaved={vi.fn()} onClose={vi.fn()} />,
    );
    // Act
    fireEvent.click(await screen.findByText('Brand images'));
    await user.upload(screen.getByLabelText('Logo'), new File(['png'], 'logo.png', { type: 'image/png' }));
    // Assert
    await waitFor(() => expect(screen.getAllByRole('img', { name: 'Meetup logo' })).toHaveLength(2));
    expect(upload).toHaveBeenCalledWith(theme.organizationId, expect.any(File));
  });
});
