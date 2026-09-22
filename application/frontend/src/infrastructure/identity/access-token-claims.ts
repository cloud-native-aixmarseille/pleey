interface AccessTokenClaims {
  readonly id?: string;
  readonly sessionId?: string;
  readonly exp?: number;
}

/** Unverified claims used only to coordinate credentials; the server validates authentication. */
export function readAccessTokenClaims(token: string | null): AccessTokenClaims | null {
  if (!token) return null;
  try {
    const payload: unknown = JSON.parse(atob((token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload || typeof payload !== 'object') return null;
    return {
      id: 'id' in payload && typeof payload.id === 'string' ? payload.id : undefined,
      sessionId: 'sessionId' in payload && typeof payload.sessionId === 'string' ? payload.sessionId : undefined,
      exp: 'exp' in payload && typeof payload.exp === 'number' ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export function isSameAccessTokenSession(previousToken: string | null, nextToken: string | null): boolean {
  if (!previousToken || !nextToken) return false;
  if (previousToken === nextToken) return true;
  const previous = readAccessTokenClaims(previousToken);
  const next = readAccessTokenClaims(nextToken);
  return Boolean(
    previous?.id && previous.sessionId && previous.id === next?.id && previous.sessionId === next?.sessionId,
  );
}
