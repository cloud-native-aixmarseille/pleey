import { useEffect, useRef, useState } from 'react';
import type { ThemeDocument } from '../../../domains/theme/entities/theme-document';

export function useThemeHistory(initial: ThemeDocument, onChange: (value: ThemeDocument) => void) {
  const entries = useRef([initial]);
  const cursor = useRef(0);
  const lastEdit = useRef({ group: '', time: 0 });
  const [, refresh] = useState(0);

  useEffect(() => {
    entries.current[cursor.current] = initial;
  }, [initial]);

  const change = (value: ThemeDocument, group = '') => {
    if (JSON.stringify(value) === JSON.stringify(entries.current[cursor.current])) return;
    const coalesce =
      group && lastEdit.current.group === group && Date.now() - lastEdit.current.time < 500 && cursor.current > 0;
    const next = entries.current.slice(0, cursor.current + (coalesce ? 0 : 1));
    entries.current = [...next, value].slice(-100);
    cursor.current = entries.current.length - 1;
    lastEdit.current = { group, time: Date.now() };
    onChange(value);
    refresh((count) => count + 1);
  };

  const step = (direction: number) => {
    const next = cursor.current + direction;
    if (next < 0 || next >= entries.current.length) return;
    cursor.current = next;
    lastEdit.current = { group: '', time: 0 };
    onChange(entries.current[next]);
    refresh((count) => count + 1);
  };

  return {
    change,
    undo: () => step(-1),
    redo: () => step(1),
    canUndo: cursor.current > 0,
    canRedo: cursor.current < entries.current.length - 1,
  };
}
