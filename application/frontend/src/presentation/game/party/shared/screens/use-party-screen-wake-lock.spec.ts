import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePartyScreenWakeLock } from './use-party-screen-wake-lock';

describe('usePartyScreenWakeLock', () => {
  const originalWakeLockDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'wakeLock');
  const originalVisibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalWakeLockDescriptor) {
      Object.defineProperty(window.navigator, 'wakeLock', originalWakeLockDescriptor);
    } else {
      Reflect.deleteProperty(window.navigator, 'wakeLock');
    }

    if (originalVisibilityDescriptor) {
      Object.defineProperty(document, 'visibilityState', originalVisibilityDescriptor);
    }
  });

  it('requests a screen wake lock when enabled on a visible page', async () => {
    let released = false;
    const request = vi.fn(async () => ({
      get released() {
        return released;
      },
      release: vi.fn(async () => {
        released = true;
      }),
    }));

    Object.defineProperty(window.navigator, 'wakeLock', {
      configurable: true,
      value: { request },
    });

    renderHook(() => usePartyScreenWakeLock(true));

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith('screen');
    });
  });

  it('releases the wake lock when the hook unmounts', async () => {
    let released = false;
    const release = vi.fn(async () => {
      released = true;
    });
    const request = vi.fn(async () => ({
      get released() {
        return released;
      },
      release,
    }));

    Object.defineProperty(window.navigator, 'wakeLock', {
      configurable: true,
      value: { request },
    });

    const { unmount } = renderHook(() => usePartyScreenWakeLock(true));

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1);
    });

    unmount();

    await waitFor(() => {
      expect(release).toHaveBeenCalledTimes(1);
    });
  });

  it('releases when hidden and re-requests when visible again', async () => {
    let released = false;
    let visibilityState: DocumentVisibilityState = 'visible';
    const release = vi.fn(async () => {
      released = true;
    });
    const request = vi.fn(async () => ({
      get released() {
        return released;
      },
      release,
    }));

    Object.defineProperty(window.navigator, 'wakeLock', {
      configurable: true,
      value: { request },
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibilityState,
    });

    renderHook(() => usePartyScreenWakeLock(true));

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      visibilityState = 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await waitFor(() => {
      expect(release).toHaveBeenCalledTimes(1);
    });

    released = false;

    await act(async () => {
      visibilityState = 'visible';
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(2);
    });
  });
});
