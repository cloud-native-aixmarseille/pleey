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
    renderWithProviders(<div>Surface</div>);

    fireEvent.keyDown(document, { key: '?', shiftKey: true });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('shared.keyboard.helpTitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'shared.keyboard.close' })).toBeInTheDocument();
  });

  it('ignores registered shortcuts when the event target is editable', () => {
    const onGlobalTrigger = vi.fn();

    renderWithProviders(<ShortcutProbe onGlobalTrigger={onGlobalTrigger} />);

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'shortcut-input' }), {
      key: 'k',
    });

    expect(onGlobalTrigger).not.toHaveBeenCalled();
  });

  it('prefers the highest-priority active scope over global shortcuts', () => {
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

    fireEvent.keyDown(document, { key: 'x' });

    expect(onScopedTrigger).toHaveBeenCalledOnce();
    expect(onGlobalTrigger).not.toHaveBeenCalled();
  });

  it('keeps shortcuts active when one of two identical registrations unmounts', () => {
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

    fireEvent.keyDown(document, { key: 'k' });
    expect(onGlobalTrigger).toHaveBeenCalledTimes(1);

    view.rerender(<DuplicateShortcutProbe renderFirst={false} />);

    fireEvent.keyDown(document, { key: 'k' });
    expect(onGlobalTrigger).toHaveBeenCalledTimes(2);
  });
});
