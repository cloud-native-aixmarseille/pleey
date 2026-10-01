import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MediaAccessGrant } from '../../../../../domains/media/ports/media-access.port';
import { createMediaAccessFixture } from '../../../../../test-utils/fixtures/media-access.fixture';
import { provideMediaAccess } from '../../../../shared/media/media-access-context';
import { PlayableQuestionMedia } from './playable-question-media';

describe('protected question media', () => {
  it('renews before expiration and keeps the displayed element mounted', async () => {
    // Arrange
    vi.useFakeTimers();
    const { initial, renewed, access } = createMediaAccessFixture();
    const view = render(provideMediaAccess(<PlayableQuestionMedia media={initial} questionText="Image" />, access));
    const image = screen.getByRole('img');
    // Act + Assert
    try {
      // Act
      await act(() => vi.advanceTimersByTimeAsync(30_000));
      // Assert
      expect(access.renew).toHaveBeenCalledWith({ id: initial.id, partyId: undefined });
      expect(screen.getByRole('img')).toBe(image);
      expect(image).toHaveAttribute('src', renewed.uri);
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });

  it('removes media immediately when renewal is denied', async () => {
    // Arrange
    vi.useFakeTimers();
    const { initial, access } = createMediaAccessFixture();
    access.renew.mockRejectedValue(new Error('revoked'));
    const view = render(provideMediaAccess(<PlayableQuestionMedia media={initial} questionText="Image" />, access));
    // Act + Assert
    try {
      // Act
      await act(() => vi.advanceTimersByTimeAsync(30_000));
      // Assert
      expect(screen.queryByRole('img')).toBeNull();
      await act(() => vi.advanceTimersByTimeAsync(600_000));
      expect(access.renew).toHaveBeenCalledTimes(1);
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });

  it('expires a stalled renewal and ignores its late response', async () => {
    // Arrange
    vi.useFakeTimers();
    const { initial, renewed, access } = createMediaAccessFixture();
    let finish!: (grant: MediaAccessGrant) => void;
    access.renew.mockReturnValue(
      new Promise<MediaAccessGrant>((resolve) => {
        finish = resolve;
      }),
    );
    const view = render(provideMediaAccess(<PlayableQuestionMedia media={initial} questionText="Image" />, access));
    // Act + Assert
    try {
      // Act
      await act(() => vi.advanceTimersByTimeAsync(60_000));
      await act(async () => finish(renewed));
      // Assert
      expect(screen.queryByRole('img')).toBeNull();
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });

  it('does not apply an old asset response after the question changes', async () => {
    // Arrange
    vi.useFakeTimers();
    const { initial, renewed, access } = createMediaAccessFixture();
    let finish!: (grant: MediaAccessGrant) => void;
    access.renew.mockReturnValue(
      new Promise<MediaAccessGrant>((resolve) => {
        finish = resolve;
      }),
    );
    const view = render(provideMediaAccess(<PlayableQuestionMedia media={initial} questionText="Image" />, access));
    // Act + Assert
    try {
      await act(() => vi.advanceTimersByTimeAsync(30_000));
      const replacement = {
        ...initial,
        id: 'asset-2',
        uri: 'https://media.example/asset-2',
        expiresAt: renewed.expiresAt,
      };
      // Act
      view.rerender(provideMediaAccess(<PlayableQuestionMedia media={replacement} questionText="Image" />, access));
      await act(async () => finish(renewed));
      // Assert
      expect(screen.getByRole('img')).toHaveAttribute('src', replacement.uri);
      view.unmount();
      await act(() => vi.advanceTimersByTimeAsync(600_000));
      expect(access.renew).toHaveBeenCalledTimes(1);
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });

  it('withholds an already expired source until authorized renewal succeeds', async () => {
    // Arrange
    const { initial, renewed, access } = createMediaAccessFixture();
    let finish!: (grant: MediaAccessGrant) => void;
    access.renew.mockReturnValue(
      new Promise<MediaAccessGrant>((resolve) => {
        finish = resolve;
      }),
    );
    const view = render(
      provideMediaAccess(
        <PlayableQuestionMedia media={{ ...initial, expiresAt: new Date(0).toISOString() }} questionText="Image" />,
        access,
      ),
    );
    // Act + Assert
    try {
      expect(screen.queryByRole('img')).toBeNull();
      // Act
      await act(async () => finish(renewed));
      // Assert
      expect(screen.getByRole('img')).toHaveAttribute('src', renewed.uri);
    } finally {
      view.unmount();
    }
  });
});
