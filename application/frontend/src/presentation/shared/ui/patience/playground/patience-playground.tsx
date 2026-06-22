import { Box } from '@mantine/core';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { PatiencePlaygroundContext } from './patience-playground-context';

interface PatiencePlaygroundProps {
  readonly children: ReactNode;
}

export function PatiencePlayground({ children }: PatiencePlaygroundProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const contextValue = useMemo(() => ({ container }), [container]);

  return (
    <PatiencePlaygroundContext.Provider value={contextValue}>
      <Box
        data-patience-playground="true"
        pos="relative"
        ref={(node) => {
          setContainer((current) => (current === node ? current : node));
        }}
      >
        {children}
      </Box>
    </PatiencePlaygroundContext.Provider>
  );
}
