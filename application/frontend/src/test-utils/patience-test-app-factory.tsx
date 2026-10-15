import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { ReactRouterRoutingAdapter } from '../infrastructure/routing/react-router-routing.adapter';
import { PresentationRoutingProvider } from '../presentation/shared/routing/router';
import {
  PatienceAnimationRegistryProvider,
  PatienceRouteProvider,
  usePatienceRouteState,
} from '../presentation/shared/ui/patience';
import { PatienceHost } from '../presentation/shared/ui/patience/patience-host';
import { PatienceAnimationId } from '../presentation/shared/ui/patience/types';

const animations = {
  [PatienceAnimationId.LEMMINGS]: () => <div data-testid="patience-animation" />,
};

function PatienceRouteProbe() {
  const { active, enabled } = usePatienceRouteState();

  return <output data-testid="patience-route-probe">{`${enabled}:${active}`}</output>;
}

export class PatienceTestAppFactory {
  create(idleAfterMs = 1_000) {
    const routing = new ReactRouterRoutingAdapter().createPort();
    const router = createMemoryRouter(
      [
        {
          element: (
            <PresentationRoutingProvider value={routing}>
              <PatienceAnimationRegistryProvider value={animations}>
                <PatienceHost>
                  <PatienceRouteProbe />
                  <Outlet />
                </PatienceHost>
              </PatienceAnimationRegistryProvider>
            </PresentationRoutingProvider>
          ),
          children: [
            {
              path: '/screens/:screenId',
              element: (
                <PatienceRouteProvider idleAfterMs={idleAfterMs}>
                  <input aria-label="Screen input" defaultValue="" />
                </PatienceRouteProvider>
              ),
            },
            { path: '/outside', element: <div>Outside patience</div> },
          ],
        },
      ],
      { initialEntries: ['/screens/first'] },
    );

    return { router, element: <RouterProvider router={router} /> };
  }
}
