import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../../../test-utils/render-with-providers';
import { JoinGameEntryActions } from './join-game-entry-actions';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('JoinGameEntryActions', () => {
  it('renders guest-step actions and delegates both callbacks', async () => {
    const user = userEvent.setup();
    const onPrimaryAction = vi.fn();
    const onBackToPin = vi.fn();

    renderWithProviders(
      <JoinGameEntryActions
        isAuthenticated={false}
        isSubmitting={false}
        onBackToPin={onBackToPin}
        onNavigateToSignIn={vi.fn()}
        onPrimaryAction={onPrimaryAction}
        showGuestStep
      />,
    );

    await user.click(screen.getByRole('button', { name: 'game.join.primaryGuestCta' }));
    await user.click(screen.getByRole('button', { name: 'game.join.backToPinCta' }));

    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(onBackToPin).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'game.join.signInCta' })).not.toBeInTheDocument();
  });

  it('shows the sign-in action before the guest step', () => {
    renderWithProviders(
      <JoinGameEntryActions
        isAuthenticated={false}
        isSubmitting={false}
        onBackToPin={vi.fn()}
        onNavigateToSignIn={vi.fn()}
        onPrimaryAction={vi.fn()}
        showGuestStep={false}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'game.join.primaryContinueCta' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'game.join.signInCta' })).toBeInTheDocument();
  });
});
