import { useCallback, useEffect, useState } from "react";
import {
  GUEST_ID_KEY,
  GUEST_NICKNAME_KEY,
} from "../../../../domains/shared/constants/storageKeys";

interface GuestState {
  nickname: string;
  id: string;
}

export function useGuestSession() {
  const [guestNickname, setGuestNickname] = useState("");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [hasHydratedGuest, setHasHydratedGuest] = useState(false);

  const syncToStorage = useCallback((state: GuestState | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (!state) {
      localStorage.removeItem(GUEST_NICKNAME_KEY);
      localStorage.removeItem(GUEST_ID_KEY);
      // Backward-compatible cleanup
      sessionStorage.removeItem(GUEST_NICKNAME_KEY);
      sessionStorage.removeItem(GUEST_ID_KEY);
      return;
    }

    localStorage.setItem(GUEST_NICKNAME_KEY, state.nickname);
    localStorage.setItem(GUEST_ID_KEY, state.id);
  }, []);

  const hydrateFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      setHasHydratedGuest(true);
      return;
    }

    const storedNickname = localStorage.getItem(GUEST_NICKNAME_KEY);
    const storedId = localStorage.getItem(GUEST_ID_KEY);

    // Backward-compatible fallback: older versions stored this in sessionStorage.
    const legacyNickname =
      storedNickname ?? sessionStorage.getItem(GUEST_NICKNAME_KEY);
    const legacyId = storedId ?? sessionStorage.getItem(GUEST_ID_KEY);

    if (legacyNickname && legacyId) {
      setGuestNickname(legacyNickname);
      setGuestId(legacyId);

      // If we came from legacy sessionStorage, migrate to localStorage.
      if (!storedNickname || !storedId) {
        localStorage.setItem(GUEST_NICKNAME_KEY, legacyNickname);
        localStorage.setItem(GUEST_ID_KEY, legacyId);
      }
    }

    setHasHydratedGuest(true);
  }, []);

  const clearGuest = useCallback(() => {
    setGuestNickname("");
    setGuestId(null);
    syncToStorage(null);
  }, [syncToStorage]);

  const registerGuest = useCallback(
    (nickname: string) => {
      const generated: GuestState = {
        nickname,
        id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      };

      setGuestNickname(generated.nickname);
      setGuestId(generated.id);
      syncToStorage(generated);

      return generated;
    },
    [syncToStorage],
  );

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return {
    guestNickname,
    guestId,
    hasHydratedGuest,
    registerGuest,
    clearGuest,
  };
}
