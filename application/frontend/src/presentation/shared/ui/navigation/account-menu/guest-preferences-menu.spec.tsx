import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { GuestPreferencesMenu } from './guest-preferences-menu';

vi.mock('../../../i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('./account-menu-preferences-panel', () => ({
  AccountMenuPreferencesPanel: () => <div>preferences-controls</div>,
}));

describe('GuestPreferencesMenu', () => {
  it('opens and closes the dedicated preferences dropdown', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    renderWithProviders(<GuestPreferencesMenu appVersion="1.2.3" />);

    // Assert
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'shared.shell.preferencesMenu' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('preferences-controls')).toBeInTheDocument();
    expect(screen.getByText('shared.shell.version (version=1.2.3)')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes when clicking outside', async () => {
    // Arrange
    const user = userEvent.setup();

    renderWithProviders(
      <>
        <GuestPreferencesMenu appVersion="" />
        <button type="button">outside</button>
      </>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'shared.shell.preferencesMenu' }));
    // Assert
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'outside' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('omits the version label when no version is available', async () => {
    // Arrange
    const user = userEvent.setup();

    renderWithProviders(<GuestPreferencesMenu appVersion="  " />);

    // Act
    await user.click(screen.getByRole('button', { name: 'shared.shell.preferencesMenu' }));

    // Assert
    expect(screen.queryByText(/shared\.shell\.version/i)).not.toBeInTheDocument();
  });
});
