import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { PlayableManagementIconActionButton } from './playable-management-icon-action-button';

describe('PlayableManagementIconActionButton', () => {
  it('renders the action label as a button', () => {
    // Arrange + Act
    renderWithUiProvider(<PlayableManagementIconActionButton iconName="arrow-up" label="Move up" onClick={() => {}} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Move up' })).toBeInTheDocument();
  });

  it('stops click propagation when requested', () => {
    // Arrange
    const onClick = vi.fn();
    const onParentClick = vi.fn();

    renderWithUiProvider(
      <div onClick={onParentClick} onKeyDown={() => {}}>
        <PlayableManagementIconActionButton iconName="trash" label="Delete" onClick={onClick} stopPropagation />
      </div>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('allows click propagation by default', () => {
    // Arrange
    const onClick = vi.fn();
    const onParentClick = vi.fn();

    renderWithUiProvider(
      <div onClick={onParentClick} onKeyDown={() => {}}>
        <PlayableManagementIconActionButton iconName="arrow-down" label="Move down" onClick={onClick} />
      </div>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Move down' }));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).toHaveBeenCalledTimes(1);
  });
});
