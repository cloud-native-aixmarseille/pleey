import { type ReactNode, useMemo, useState } from "react";

import { PatiencePlaygroundContext } from "./PatiencePlaygroundContext";

interface PatiencePlaygroundProps {
  children: ReactNode;
  className?: string;
}

export function PatiencePlayground({
  children,
  className,
}: PatiencePlaygroundProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const contextValue = useMemo(() => ({ container }), [container]);

  return (
    <PatiencePlaygroundContext.Provider value={contextValue}>
      <div
        ref={(node) => {
          setContainer((current) => (current === node ? current : node));
        }}
        className={className ?? "relative"}
        data-patience-playground="true"
      >
        {children}
      </div>
    </PatiencePlaygroundContext.Provider>
  );
}
