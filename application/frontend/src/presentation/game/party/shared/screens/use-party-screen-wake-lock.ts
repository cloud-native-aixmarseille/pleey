import { useEffect } from 'react';

export function usePartyScreenWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const wakeLock = (window.navigator as Navigator).wakeLock as WakeLock | undefined;
    if (!wakeLock) {
      return;
    }

    let isDisposed = false;
    let wakeLockSentinel: WakeLockSentinel | null = null;

    const releaseWakeLock = async () => {
      if (!wakeLockSentinel) {
        return;
      }

      const currentSentinel = wakeLockSentinel;
      wakeLockSentinel = null;
      currentSentinel.onrelease = null;

      try {
        if (!currentSentinel.released) {
          await currentSentinel.release();
        }
      } catch {
        // Ignore release errors and allow future lock attempts.
      }
    };

    const requestWakeLock = async () => {
      if (isDisposed || wakeLockSentinel || document.visibilityState !== 'visible') {
        return;
      }

      try {
        const sentinel = await wakeLock.request('screen');

        if (isDisposed) {
          try {
            if (!sentinel.released) {
              await sentinel.release();
            }
          } catch {
            // Ignore teardown race conditions after unmount.
          }

          return;
        }

        wakeLockSentinel = sentinel;
        sentinel.onrelease = () => {
          wakeLockSentinel = null;

          if (isDisposed || document.visibilityState !== 'visible') {
            return;
          }

          void requestWakeLock();
        };
      } catch {
        // Browsers can deny wake-lock requests; keep the UI functional.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock();
        return;
      }

      void releaseWakeLock();
    };

    void requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isDisposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void releaseWakeLock();
    };
  }, [enabled]);
}
