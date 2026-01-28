import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../../../test-utils/render-with-providers';
import { JoinGameEntryPanel } from './join-game-entry-panel';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('JoinGameEntryPanel', () => {
  it('shows the completed pin badge before the guest step', () => {
    renderWithProviders(
      <JoinGameEntryPanel
        flowService={{ expectedPinLength: 6 }}
        isAuthenticated={false}
        isSubmitting={false}
        normalizedPin="123456"
        nickname=""
        pinErrorCode={null}
        nicknameErrorCode={null}
        errorCode={null}
        requestMessage={null}
        showGuestStep={false}
        userName={null}
        onPinBlur={vi.fn()}
        onPinChange={vi.fn()}
        onNicknameBlur={vi.fn()}
        onNicknameChange={vi.fn()}
        onPrimaryAction={vi.fn()}
        onBackToPin={vi.fn()}
        onNavigateToSignIn={vi.fn()}
      />,
    );

    expect(screen.getByText('game.join.pinLabel ✓')).toBeInTheDocument();
    expect(screen.queryByLabelText('game.join.nicknameLabel')).not.toBeInTheDocument();
  });

  it('shows the guest nickname step and forwards field changes', async () => {
    const onPinChange = vi.fn();
    const onNicknameChange = vi.fn();

    renderWithProviders(
      <JoinGameEntryPanel
        flowService={{ expectedPinLength: 6 }}
        isAuthenticated={false}
        isSubmitting={false}
        normalizedPin="123456"
        nickname="Sky"
        pinErrorCode={null}
        nicknameErrorCode={null}
        errorCode={null}
        requestMessage="game.join.requestAccepted"
        showGuestStep
        userName={null}
        onPinBlur={vi.fn()}
        onPinChange={onPinChange}
        onNicknameBlur={vi.fn()}
        onNicknameChange={onNicknameChange}
        onPrimaryAction={vi.fn()}
        onBackToPin={vi.fn()}
        onNavigateToSignIn={vi.fn()}
      />,
    );

    const pinInput = document.getElementById('join-game-pin');
    const nicknameInput = document.getElementById('join-game-nickname');

    expect(pinInput).not.toBeNull();
    expect(nicknameInput).not.toBeNull();

    fireEvent.change(pinInput as HTMLInputElement, {
      target: { value: '654321' },
    });
    fireEvent.change(nicknameInput as HTMLInputElement, {
      target: { value: 'Nova' },
    });

    expect(document.getElementById('join-game-nickname')).not.toBeNull();
    expect(screen.getByText('game.join.requestAccepted')).toBeInTheDocument();
    expect(onPinChange).toHaveBeenLastCalledWith('654321');
    expect(onNicknameChange).toHaveBeenLastCalledWith('Nova');
  });
});
