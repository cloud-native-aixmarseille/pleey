import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { PatiencePlaygroundContext } from './patience-playground-context';

const defaultPlaygroundStyle = { position: 'relative' } as const;

interface PatiencePlaygroundProps {
  readonly children: ReactNode;
  readonly style?: Record<string, string | number>;
}

export function PatiencePlayground({ children, style }: PatiencePlaygroundProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const contextValue = useMemo(() => ({ container }), [container]);

  return (
    <PatiencePlaygroundContext.Provider value={contextValue}>
      <div
        data-patience-playground="true"
        ref={(node) => {
          setContainer((current) => (current === node ? current : node));
        }}
        style={style ?? defaultPlaygroundStyle}
      >
        {children}
      </div>
    </PatiencePlaygroundContext.Provider>
  );
}
