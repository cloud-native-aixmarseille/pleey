import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RoutingMockFactory } from '../../../../test-utils/mocks/routing-mock-factory';
import { renderWithRoutingProvider } from '../../../../test-utils/render-with-routing-provider';
import { ExternalTextLink, InlineTextLink, NavPillLink, PrimaryActionLink } from './links';

const routingPort = new RoutingMockFactory().createRoutingPort();

describe('links', () => {
  describe('NavPillLink()', () => {
    it('renders a routed link with the target href', () => {
      renderWithRoutingProvider(<NavPillLink to="/pin/123">Join game</NavPillLink>, routingPort);

      expect(screen.getByRole('link', { name: 'Join game' })).toHaveAttribute('href', '/pin/123');
    });
  });

  describe('PrimaryActionLink()', () => {
    it('renders a routed primary action link', () => {
      renderWithRoutingProvider(
        <PrimaryActionLink to="/workspace/dashboard">Dashboard</PrimaryActionLink>,
        routingPort,
      );

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/workspace/dashboard',
      );
    });

    it('keeps the same accessible name when icon sections are provided', () => {
      renderWithRoutingProvider(
        <PrimaryActionLink
          leftSection={<span aria-hidden="true">L</span>}
          to="/workspace/dashboard"
        >
          Dashboard
        </PrimaryActionLink>,
        routingPort,
      );

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/workspace/dashboard',
      );
    });
  });

  describe('InlineTextLink()', () => {
    it('renders inline copy link content', () => {
      renderWithRoutingProvider(
        <InlineTextLink to="/help">Read guide</InlineTextLink>,
        routingPort,
      );

      expect(screen.getByRole('link', { name: 'Read guide' })).toHaveAttribute('href', '/help');
    });
  });

  describe('ExternalTextLink()', () => {
    it('renders an external anchor with the target href', () => {
      renderWithRoutingProvider(
        <ExternalTextLink href="https://pleey.example.com/help">External guide</ExternalTextLink>,
        routingPort,
      );

      expect(screen.getByRole('link', { name: 'External guide' })).toHaveAttribute(
        'href',
        'https://pleey.example.com/help',
      );
      expect(screen.getByRole('link', { name: 'External guide' })).toHaveAttribute(
        'target',
        '_blank',
      );
    });
  });
});
