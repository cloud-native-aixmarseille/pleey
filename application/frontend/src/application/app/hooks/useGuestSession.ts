import { useCallback, useEffect, useState } from "react";
import {
  GUEST_ID_KEY,
  GUEST_NICKNAME_KEY,
} from "../../../shared/constants/storageKeys";

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
      sessionStorage.removeItem(GUEST_NICKNAME_KEY);
      sessionStorage.removeItem(GUEST_ID_KEY);
      return;
    }

    sessionStorage.setItem(GUEST_NICKNAME_KEY, state.nickname);
    sessionStorage.setItem(GUEST_ID_KEY, state.id);
  }, []);

  const hydrateFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      setHasHydratedGuest(true);
      return;
    }

    const storedNickname = sessionStorage.getItem(GUEST_NICKNAME_KEY);
    const storedId = sessionStorage.getItem(GUEST_ID_KEY);

    if (storedNickname && storedId) {
      setGuestNickname(storedNickname);
      setGuestId(storedId);
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
