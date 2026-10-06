import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import { ThemeManagementFacade } from '../../../application/workspace/themes/facades/theme-management.facade';
import { ThemeError, ThemeErrorCode } from '../../../domains/theme/errors/theme-error';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { renderThemeEditor as renderWithDataRouter } from '../../../test-utils/render-theme-editor';
import { sharedEn } from '../../shared/i18n/en';
import { themeEn } from '../i18n/en';
import { ThemeBuilderForm } from './theme-builder-form';

i18next.addResourceBundle('en', 'translation', sharedEn, true, true);
i18next.addResourceBundle('en', 'translation', themeEn, true, true);
vi.mock('../../identity/contexts/auth-context', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useAuth: () => ({ hasRestoredSession: true, user: { id: 'studio-user' } }),
}));
const fixtures = new ThemeFixtureFactory();

describe('ThemeDocumentEditor', () => {
  it('keeps the original revision when an outdated recovery draft is persisted again', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const recovered = fixtures.createDocument({ name: 'Older local draft' });
    const read = vi
      .spyOn(ThemeManagementFacade.prototype, 'readDraft')
      .mockReturnValue({ document: recovered, sourceRevision: 1, updatedAt: Date.now() });
    const write = vi.spyOn(ThemeManagementFacade.prototype, 'writeDraft').mockReturnValue(true);
    const save = vi.spyOn(ThemeManagementFacade.prototype, 'save');
    onTestFinished(() => {
      read.mockRestore();
      write.mockRestore();
      save.mockRestore();
    });
    renderWithDataRouter(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onCancel={vi.fn()} onSaved={vi.fn()} />,
    );
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Restore draft' }));
    fireEvent(window, new Event('pagehide'));
    fireEvent.submit(screen.getByRole('form', { name: 'Theme editor' }));
    // Assert
    expect(write).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ document: recovered, sourceRevision: 1 }),
    );
    expect(screen.getByRole('button', { name: 'Save theme' })).toBeDisabled();
    expect(save).not.toHaveBeenCalled();
  });

  it('keeps the last valid preview and blocks saving an incomplete color', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    renderWithDataRouter(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onCancel={vi.fn()} onSaved={vi.fn()} />,
    );
    // Act
    fireEvent.change(await screen.findByLabelText('Signature color (HEX)'), { target: { value: '#bad' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review settings' }));
    // Assert
    await waitFor(() => expect(screen.getByLabelText('Signature color (HEX)')).toHaveFocus());
    expect(await screen.findByText('Showing the last valid preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save theme' })).toBeDisabled();
    expect(screen.getByRole('region', { name: 'Live preview' }).querySelector('[data-theme-preview]')).toHaveStyle({
      '--ui-color-brand-primary': '#1ee8d7',
    });
  });

  it('updates the actual answer tiles when the signature color changes', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    renderWithDataRouter(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onCancel={vi.fn()} onSaved={vi.fn()} />,
    );
    const before = (await screen.findByRole('button', { name: 'The people' })).getAttribute('style');
    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Violet' }));
    // Assert
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'The people' }).getAttribute('style')).not.toBe(before),
    );
    expect(screen.getByRole('button', { name: 'Save theme' })).toBeEnabled();
  });

  it('uses the latest saved revision for the next edit', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    let revision = theme.revision;
    const save = vi
      .spyOn(ThemeManagementFacade.prototype, 'save')
      .mockImplementation(async (command) => ({ ...theme, document: command.document, revision: ++revision }));
    const onSaved = vi.fn();
    onTestFinished(() => save.mockRestore());
    renderWithDataRouter(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onCancel={vi.fn()} onSaved={onSaved} />,
    );
    // Act
    fireEvent.change(await screen.findByLabelText('Theme name'), { target: { value: 'First edit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }));
    await screen.findAllByText('Saved to your library');
    fireEvent.change(screen.getByLabelText('Theme name'), { target: { value: 'Second edit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }));
    await screen.findAllByText('Saved to your library');
    // Assert
    expect(screen.getByLabelText('Theme name')).toHaveValue('Second edit');
    await waitFor(() =>
      expect(save).toHaveBeenLastCalledWith(
        expect.objectContaining({ expectedRevision: 3, document: expect.objectContaining({ name: 'Second edit' }) }),
      ),
    );
  });

  it('retains the draft after a failed save and retries without losing overrides', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme({
      document: fixtures.createDocument({ overrides: { radius: { panel: '23px' } } }),
    });
    const save = vi
      .spyOn(ThemeManagementFacade.prototype, 'save')
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementation(async (command) => ({ ...theme, document: command.document, revision: 3 }));
    const onSaved = vi.fn();
    onTestFinished(() => save.mockRestore());
    renderWithDataRouter(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onCancel={vi.fn()} onSaved={onSaved} />,
    );
    // Act
    fireEvent.change(await screen.findByLabelText('Theme name'), { target: { value: 'Keep this draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }));
    await screen.findByText(themeEn.theme.builder.saveFailed);
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }));
    // Assert
    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(
        expect.objectContaining({ document: { ...theme.document, name: 'Keep this draft' } }),
      ),
    );
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('offers recovery without silently applying a local draft', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const recovered = fixtures.createDocument({ name: 'Recovered draft', overrides: { radius: { panel: '23px' } } });
    const read = vi
      .spyOn(ThemeManagementFacade.prototype, 'readDraft')
      .mockReturnValue({ document: recovered, sourceRevision: 2, updatedAt: Date.now() });
    const save = vi
      .spyOn(ThemeManagementFacade.prototype, 'save')
      .mockResolvedValue({ ...theme, document: recovered, revision: 3 });
    onTestFinished(() => {
      read.mockRestore();
      save.mockRestore();
    });
    renderWithDataRouter(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onCancel={vi.fn()} onSaved={vi.fn()} />,
    );
    const originalName = (await screen.findByLabelText('Theme name')).getAttribute('value');
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Restore draft' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }));
    // Assert
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(expect.objectContaining({ document: recovered, expectedRevision: 2 })),
    );
    expect(originalName).toBe('Meetup');
  });

  it('saves conflicting edits as a new theme without overwriting the original', async ({ onTestFinished }) => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const copy = fixtures.createManagedTheme({ id: 'custom:01900000-0000-7000-8000-000000000003', revision: 1 });
    const save = vi
      .spyOn(ThemeManagementFacade.prototype, 'save')
      .mockRejectedValueOnce(new ThemeError(ThemeErrorCode.REVISION_CONFLICT, { themeId: theme.id }))
      .mockResolvedValue(copy);
    const onSaved = vi.fn();
    onTestFinished(() => save.mockRestore());
    renderWithDataRouter(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onCancel={vi.fn()} onSaved={onSaved} />,
    );
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Save theme' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Save as new theme' }));
    // Assert
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(copy));
    expect(save).toHaveBeenLastCalledWith({
      organizationId: theme.organizationId,
      document: theme.document,
      themeId: undefined,
      expectedRevision: undefined,
    });
  });

  it('guards route navigation and preserves edits when the user stays', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const { router } = renderWithDataRouter(
      <ThemeBuilderForm organizationId={theme.organizationId} theme={theme} onCancel={vi.fn()} onSaved={vi.fn()} />,
    );
    // Act
    fireEvent.change(await screen.findByLabelText('Theme name'), { target: { value: 'Still editing' } });
    await act(() => router.navigate('/another-page'));
    fireEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByLabelText('Theme name')).toHaveValue('Still editing');
  });
});
