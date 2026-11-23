import type { PropsWithChildren } from 'react';
import { PatienceOverlay } from './overlay/patience-overlay';
import { usePatienceAnimationRegistry } from './patience-animation-registry-context';
import { PatienceRouteStateProvider, usePatienceRouteState } from './patience-route-context';
import { PatiencePlayground } from './playground/patience-playground';
import { PatienceAnimationId } from './types';

function PatienceHostOverlay() {
  const { active, enabled } = usePatienceRouteState();
  const animations = usePatienceAnimationRegistry();

  return (
    <PatienceOverlay
      active={enabled && active}
      animations={animations}
      currentAnimation={PatienceAnimationId.LEMMINGS}
      delayMs={600}
    />
  );
}

export function PatienceHost({ children }: PropsWithChildren) {
  return (
    <PatienceRouteStateProvider>
      <PatiencePlayground>
        {children}
        <PatienceHostOverlay />
      </PatiencePlayground>
    </PatienceRouteStateProvider>
  );
}
