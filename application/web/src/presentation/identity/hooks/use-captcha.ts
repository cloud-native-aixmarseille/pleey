import { useRef, useState } from 'react';

export function useCaptcha() {
  const tokenRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [hasError, setHasError] = useState(false);

  function updateToken(nextToken: string | null) {
    tokenRef.current = nextToken;
    setToken(nextToken);
    setHasError(false);
  }

  function clearToken() {
    tokenRef.current = null;
    setToken(null);
  }

  function consumeToken(): string | null {
    const currentToken = tokenRef.current;
    clearToken();
    setHasError(false);
    setRevision((current) => current + 1);
    return currentToken;
  }

  function reportError() {
    clearToken();
    setHasError(true);
  }

  return { isVerified: token !== null, revision, hasError, updateToken, consumeToken, reportError };
}
