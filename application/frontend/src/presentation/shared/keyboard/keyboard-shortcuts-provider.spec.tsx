import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils/render-with-providers';
import { useKeyboardShortcut, useShortcutScope } from './keyboard-shortcuts-provider';

function ShortcutProbe({
  onGlobalTrigger,
  onScopedTrigger,
}: {
  readonly onGlobalTrigger?: () => void;
  readonly onScopedTrigger?: () => void;
}) {
  if (onGlobalTrigger) {
    useKeyboardShortcut({
      combo: { key: 'k' },
      descriptionKey: 'shared.keyboard.shortcutsHelp',
      execute: onGlobalTrigger,
      id: 'global-trigger',
      scope: 'global',
    });
  }

  if (onScopedTrigger) {
    useShortcutScope('test-scope', { priority: 10 });
    useKeyboardShortcut({
      combo: { key: 'x' },
      descriptionKey: 'shared.keyboard.shortcutsHelp',
      execute: onScopedTrigger,
      id: 'scoped-trigger',
      scope: 'test-scope',
      scopeLabelKey: 'shared.keyboard.globalGroup',
    });
  }

  return <input aria-label="shortcut-input" />;
}

describe('KeyboardShortcutsProvider', () => {
  it('opens the shortcuts help dialog with the global question-mark shortcut', async () => {
    // Arrange
    renderWithProviders(<div>Surface</div>);

    // Act
    fireEvent.keyDown(document, { key: '?', shiftKey: true });

    // Assert
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('shared.keyboard.helpTitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'shared.keyboard.close' })).toBeInTheDocument();
  });

  it('ignores registered shortcuts when the event target is editable', () => {
    // Arrange
    const onGlobalTrigger = vi.fn();

    renderWithProviders(<ShortcutProbe onGlobalTrigger={onGlobalTrigger} />);

    // Act
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'shortcut-input' }), {
      key: 'k',
    });

    // Assert
    expect(onGlobalTrigger).not.toHaveBeenCalled();
  });

  it('prefers the highest-priority active scope over global shortcuts', () => {
    // Arrange
    const onGlobalTrigger = vi.fn();
    const onScopedTrigger = vi.fn();

    function ScopePriorityProbe() {
      useShortcutScope('test-scope', { priority: 10 });
      useKeyboardShortcut({
        combo: { key: 'x' },
        descriptionKey: 'shared.keyboard.shortcutsHelp',
        execute: onGlobalTrigger,
        id: 'global-x-trigger',
        scope: 'global',
      });
      useKeyboardShortcut({
        combo: { key: 'x' },
        descriptionKey: 'shared.keyboard.shortcutsHelp',
        execute: onScopedTrigger,
        id: 'scoped-x-trigger',
        scope: 'test-scope',
      });

      return <div>Scope priority</div>;
    }

    renderWithProviders(<ScopePriorityProbe />);

    // Act
    fireEvent.keyDown(document, { key: 'x' });

    // Assert
    expect(onScopedTrigger).toHaveBeenCalledOnce();
    expect(onGlobalTrigger).not.toHaveBeenCalled();
  });

  it('keeps shortcuts active when one of two identical registrations unmounts', () => {
    // Arrange
    const onGlobalTrigger = vi.fn();

    function DuplicateShortcutProbe({ renderFirst }: { readonly renderFirst: boolean }) {
      return (
        <>
          {renderFirst ? <ShortcutProbe onGlobalTrigger={onGlobalTrigger} /> : null}
          <ShortcutProbe onGlobalTrigger={onGlobalTrigger} />
        </>
      );
    }

    const view = renderWithProviders(<DuplicateShortcutProbe renderFirst />);

    // Act
    fireEvent.keyDown(document, { key: 'k' });
    // Assert
    expect(onGlobalTrigger).toHaveBeenCalledTimes(1);

    view.rerender(<DuplicateShortcutProbe renderFirst={false} />);

    fireEvent.keyDown(document, { key: 'k' });
    expect(onGlobalTrigger).toHaveBeenCalledTimes(2);
  });
});
