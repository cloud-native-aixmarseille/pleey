import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GuideTourFacade } from '../../../application/guide/facades/guide-tour.facade';
import { GuideFixtureFactory } from '../../../test-utils/fixtures/guide-fixture-factory';
import { StoragePortMockFactory } from '../../../test-utils/mocks/storage-port-mock-factory';
import { renderWithProviders } from '../../../test-utils/render-with-providers';
import { provideGuide } from './guide-context';
import { GuideLaunch } from './guide-launch';

describe('GuideLaunch', () => {
  it('dismisses the launch tooltip and offers replay after completion', async () => {
    // Arrange
    const user = userEvent.setup();
    const tour = {
      start: vi.fn((_guide, finish: () => void) => {
        finish();
        return true;
      }),
      stop: vi.fn(),
    };
    const facade = new GuideTourFacade(
      [new GuideFixtureFactory().create()],
      tour,
      new StoragePortMockFactory().create(),
    );
    renderWithProviders(provideGuide(<GuideLaunch guideId="dashboard-home" />, facade));
    await user.hover(screen.getByRole('button', { name: 'shared.guide.start' }));
    expect(await screen.findByRole('tooltip')).toBeVisible();
    // Act
    await user.click(screen.getByRole('button', { name: 'shared.guide.start' }));
    // Assert
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'shared.guide.replay' })).toBeVisible();
  });
  it('keeps an explicit deep-link tour open through StrictMode effect cleanup', () => {
    // Arrange
    const previousUrl = window.location.href;
    window.history.replaceState(null, '', '?guide=dashboard-home');
    let active = false;
    const tour = {
      start: () => {
        active = true;
        return true;
      },
      stop: () => {
        active = false;
      },
    };
    const facade = new GuideTourFacade(
      [new GuideFixtureFactory().create()],
      tour,
      new StoragePortMockFactory().create(),
    );
    // Act + Assert
    try {
      const view = renderWithProviders(provideGuide(<GuideLaunch guideId="dashboard-home" />, facade));
      // Assert
      expect(active).toBe(true);
      view.unmount();
    } finally {
      window.history.replaceState(null, '', previousUrl);
    }
  });
});
