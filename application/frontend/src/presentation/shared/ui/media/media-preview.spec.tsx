import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaPreview } from './media-preview';

describe('MediaPreview', () => {
  it.each([true, false])('preserves playback position and paused=%s when its URL changes', (paused) => {
    // Arrange
    const view = render(<MediaPreview label="Audio" mimeType="audio/mpeg" src="https://media.example/asset?old" />);
    const player = screen.getByLabelText('Audio') as HTMLAudioElement;
    player.currentTime = 37;
    Object.defineProperty(player, 'paused', { configurable: true, value: paused });
    const load = vi.spyOn(player, 'load').mockImplementation(() => {
      player.currentTime = 0;
    });
    const play = vi.spyOn(player, 'play').mockResolvedValue(undefined);
    const pause = vi.spyOn(player, 'pause').mockImplementation(() => undefined);
    // Act
    view.rerender(<MediaPreview label="Audio" mimeType="audio/mpeg" src="https://media.example/asset?renewed" />);
    fireEvent.loadedMetadata(player);
    // Assert
    expect(screen.getByLabelText('Audio')).toBe(player);
    expect(load).toHaveBeenCalledOnce();
    expect(player.currentTime).toBe(37);
    expect(play).toHaveBeenCalledTimes(paused ? 0 : 1);
    view.unmount();
    expect(pause).toHaveBeenCalledTimes(paused ? 0 : 1);
  });
});
