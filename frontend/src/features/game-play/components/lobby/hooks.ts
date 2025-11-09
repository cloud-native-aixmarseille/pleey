import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface CopyMessages {
  readonly success: () => string;
  readonly error: () => string;
}

interface UseCopyGamePinOptions {
  readonly gamePin: string;
  readonly messages: CopyMessages;
  readonly resetDelay?: number;
}

interface PlayerCountFormatters {
  readonly initial: (totalPlayers: number) => string;
  readonly joined: (delta: number, totalPlayers: number) => string;
  readonly left: (delta: number, totalPlayers: number) => string;
}

export function useJoinLink(joinPath: string = "/game/join") {
  const [joinUrl, setJoinUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setJoinUrl(`${window.location.origin}${joinPath}`);
  }, [joinPath]);

  return joinUrl;
}

export function useCopyGamePin({
  gamePin,
  messages,
  resetDelay = 2000,
}: UseCopyGamePinOptions) {
  const [copiedPin, setCopiedPin] = useState(false);
  const [copyStatusMessage, setCopyStatusMessage] = useState("");
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimeout = useCallback(() => {
    if (!resetTimeoutRef.current) {
      return;
    }

    clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = null;
  }, []);

  const copyPinToClipboard = useCallback(async () => {
    clearResetTimeout();

    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard API not available");
      }

      await navigator.clipboard.writeText(gamePin);
      setCopiedPin(true);
      setCopyStatusMessage(messages.success());
    } catch (error) {
      setCopiedPin(false);
      setCopyStatusMessage(messages.error());
    }

    resetTimeoutRef.current = setTimeout(() => {
      setCopiedPin(false);
      setCopyStatusMessage("");
      resetTimeoutRef.current = null;
    }, resetDelay);
  }, [clearResetTimeout, gamePin, messages, resetDelay]);

  useEffect(() => clearResetTimeout, [clearResetTimeout]);

  return {
    copiedPin,
    copyStatusMessage,
    copyPinToClipboard,
  } as const;
}

export function usePlayerCountMessage(
  totalPlayers: number,
  formatters: PlayerCountFormatters
) {
  const previousCountRef = useRef(totalPlayers);
  const [message, setMessage] = useState(() =>
    formatters.initial(totalPlayers)
  );

  useEffect(() => {
    const previousCount = previousCountRef.current;

    if (totalPlayers === previousCount) {
      setMessage(formatters.initial(totalPlayers));
      return;
    }

    if (totalPlayers > previousCount) {
      const delta = totalPlayers - previousCount;
      setMessage(formatters.joined(delta, totalPlayers));
    } else {
      const delta = previousCount - totalPlayers;
      setMessage(formatters.left(delta, totalPlayers));
    }

    previousCountRef.current = totalPlayers;
  }, [totalPlayers, formatters]);

  return message;
}
