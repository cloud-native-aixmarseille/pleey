import { useEffect, useState } from 'react';
import type { MediaAccessGrant } from '../../../domains/media/ports/media-access.port';
import { useMediaAccess } from './media-access-context';

export function useMediaAccessGrant(initial: MediaAccessGrant): MediaAccessGrant | null {
  const access = useMediaAccess();
  const [grant, setGrant] = useState<MediaAccessGrant | null>(() =>
    Date.parse(initial.expiresAt) > Date.now() ? initial : null,
  );

  useEffect(() => {
    let active = true;
    let renewalTimer: ReturnType<typeof setTimeout>;
    let expiryTimer: ReturnType<typeof setTimeout>;
    const stop = () => {
      active = false;
      clearTimeout(renewalTimer);
      clearTimeout(expiryTimer);
      setGrant(null);
    };
    const renew = async () => {
      try {
        const next = await access.renew({ id: initial.id, partyId: initial.partyId });
        if (!active) return;
        if (
          next.id !== initial.id ||
          next.partyId !== initial.partyId ||
          Date.parse(next.expiresAt) <= Date.now() + 30_000 ||
          !Number.isFinite(Date.parse(next.expiresAt))
        ) {
          stop();
          return;
        }
        setGrant(next);
        schedule(next);
      } catch {
        if (active) stop();
      }
    };
    const schedule = (current: MediaAccessGrant) => {
      clearTimeout(renewalTimer);
      clearTimeout(expiryTimer);
      const remaining = Date.parse(current.expiresAt) - Date.now();
      if (!Number.isFinite(remaining)) {
        stop();
        return;
      }
      // A suspended tab must never keep using an expired grant while renewal hangs.
      expiryTimer = setTimeout(stop, Math.max(0, remaining));
      renewalTimer = setTimeout(() => void renew(), Math.max(0, remaining - 30_000));
    };
    if (Date.parse(initial.expiresAt) > Date.now()) {
      setGrant(initial);
      schedule(initial);
    } else {
      setGrant(null);
      expiryTimer = setTimeout(stop, 10_000);
      void renew();
    }
    return () => {
      active = false;
      clearTimeout(renewalTimer);
      clearTimeout(expiryTimer);
    };
  }, [access, initial.id, initial.partyId, initial.uri, initial.expiresAt, initial.mimeType]);

  return grant;
}
