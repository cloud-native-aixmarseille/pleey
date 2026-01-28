import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { RoutingPort } from '../../../../application/shared/contracts/routing.port';
import { RoutingMockFactory } from '../../../../test-utils/factories/routing-mock-factory';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { PresentationRoutingProvider } from '../../routing/router';
import { InlineTextLink, NavPillLink, PrimaryActionLink } from './links';

const routingPort: RoutingPort = new RoutingMockFactory().createRoutingPort();

describe('links', () => {
  describe('NavPillLink()', () => {
    it('renders a routed link with the target href', () => {
      renderWithUiProvider(
        <PresentationRoutingProvider value={routingPort}>
          <NavPillLink to="/game/join">Join game</NavPillLink>
        </PresentationRoutingProvider>,
      );

      expect(screen.getByRole('link', { name: 'Join game' })).toHaveAttribute('href', '/game/join');
    });
  });

  describe('PrimaryActionLink()', () => {
    it('renders a routed primary action link', () => {
      renderWithUiProvider(
        <PresentationRoutingProvider value={routingPort}>
          <PrimaryActionLink to="/workspace/dashboard">Dashboard</PrimaryActionLink>
        </PresentationRoutingProvider>,
      );

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/workspace/dashboard',
      );
    });

    it('keeps the same accessible name when icon sections are provided', () => {
      renderWithUiProvider(
        <PresentationRoutingProvider value={routingPort}>
          <PrimaryActionLink
            leftSection={<span aria-hidden="true">L</span>}
            to="/workspace/dashboard"
          >
            Dashboard
          </PrimaryActionLink>
        </PresentationRoutingProvider>,
      );

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/workspace/dashboard',
      );
    });
  });

  describe('InlineTextLink()', () => {
    it('renders inline copy link content', () => {
      renderWithUiProvider(
        <PresentationRoutingProvider value={routingPort}>
          <InlineTextLink to="/help">Read guide</InlineTextLink>
        </PresentationRoutingProvider>,
      );

      expect(screen.getByRole('link', { name: 'Read guide' })).toHaveAttribute('href', '/help');
    });
  });
});
