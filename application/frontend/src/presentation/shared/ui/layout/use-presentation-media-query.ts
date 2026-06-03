import { useEffect, useState } from 'react';

const PRESENTATION_MOBILE_MEDIA_QUERY = '(max-width: 48em)';

export function usePresentationMediaQuery(
  query = PRESENTATION_MOBILE_MEDIA_QUERY,
  initialValue = false,
): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return initialValue;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);

    handleChange();
    mediaQueryList.addEventListener('change', handleChange);

    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
