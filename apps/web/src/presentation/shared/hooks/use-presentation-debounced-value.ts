import { useEffect, useState } from 'react';

const PRESENTATION_DEBOUNCE_DELAY_MS = 200;

export function usePresentationDebouncedValue<T>(value: T) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, PRESENTATION_DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value]);

  return [debouncedValue] as const;
}
