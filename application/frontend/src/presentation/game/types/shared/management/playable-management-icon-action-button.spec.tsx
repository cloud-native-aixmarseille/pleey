import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { PlayableManagementIconActionButton } from './playable-management-icon-action-button';

describe('PlayableManagementIconActionButton', () => {
  it('renders the action label as a button', () => {
    renderWithUiProvider(
      <PlayableManagementIconActionButton iconName="arrow-up" label="Move up" onClick={() => {}} />,
    );

    expect(screen.getByRole('button', { name: 'Move up' })).toBeInTheDocument();
  });

  it('stops click propagation when requested', () => {
    const onClick = vi.fn();
    const onParentClick = vi.fn();

    renderWithUiProvider(
      <div onClick={onParentClick} onKeyDown={() => {}}>
        <PlayableManagementIconActionButton
          iconName="trash"
          label="Delete"
          onClick={onClick}
          stopPropagation
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('allows click propagation by default', () => {
    const onClick = vi.fn();
    const onParentClick = vi.fn();

    renderWithUiProvider(
      <div onClick={onParentClick} onKeyDown={() => {}}>
        <PlayableManagementIconActionButton
          iconName="arrow-down"
          label="Move down"
          onClick={onClick}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Move down' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).toHaveBeenCalledTimes(1);
  });
});
