import { type PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ReleaseState = 'checking' | 'supported' | 'update-required' | 'unavailable';

interface ReleaseResponse {
  readonly identityMajor: number;
  readonly httpMajor: number;
  readonly gameMajor: number;
}

export function ReleaseCompatibilityBoundary({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const [state, setState] = useState<ReleaseState>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    fetch('/api/release', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('release-unavailable');
        return (await response.json()) as ReleaseResponse;
      })
      .then((release) => {
        if (!active) return;
        const supported =
          release.identityMajor === 1 && release.httpMajor === 1 && release.gameMajor === 1;
        setState(supported ? 'supported' : 'update-required');
      })
      .catch(() => {
        if (active) setState('unavailable');
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  if (state === 'supported') return children;
  if (state === 'checking') return null;

  return (
    <main role="alert">
      <p>{t(state === 'update-required' ? 'common.release.updateRequired' : 'common.release.unavailable')}</p>
      {state === 'unavailable' ? (
        <button type="button" onClick={() => setAttempt((current) => current + 1)}>
          {t('common.release.retry')}
        </button>
      ) : null}
    </main>
  );
}
