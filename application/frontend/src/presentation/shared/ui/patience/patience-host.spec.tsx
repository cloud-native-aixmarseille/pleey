import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import {
  PatienceAnimationRegistryProvider,
  PatienceRouteProvider,
  usePatienceRouteState,
} from './index';
import { PatienceHost } from './patience-host';
import { PatienceAnimationId } from './types';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', () => ({
  usePresentationTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const patienceAnimations = {
  [PatienceAnimationId.LEMMINGS]: () => <div data-testid="patience-animation" />,
};

function PatienceRouteProbe() {
  const { active, enabled } = usePatienceRouteState();

  return (
    <output data-testid="patience-route-probe">
      {String(enabled)}:{String(active)}
    </output>
  );
}

describe('PatienceHost', () => {
  it('mounts the playground once at the host and exposes route-enabled patience state', async () => {
    renderWithUiProvider(
      <PatienceAnimationRegistryProvider value={patienceAnimations}>
        <PatienceHost>
          <PatienceRouteProbe />
          <PatienceRouteProvider idleAfterMs={0}>
            <div>Route content</div>
          </PatienceRouteProvider>
        </PatienceHost>
      </PatienceAnimationRegistryProvider>,
    );

    expect(document.querySelector('[data-patience-playground="true"]')).not.toBeNull();
    expect(await screen.findByTestId('patience-route-probe')).toHaveTextContent('true:true');
  });
});
