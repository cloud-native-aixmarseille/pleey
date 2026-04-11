import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RoutingMockFactory } from '../../../test-utils/mocks/routing-mock-factory';
import {
  renderHookWithRoutingProvider,
  renderWithRoutingProvider,
} from '../../../test-utils/render-with-routing-provider';
import { createLink, Outlet, usePresentationNavigate, usePresentationParams } from './router';

describe('router', () => {
  const navigate = vi.fn();
  const routingPort = new RoutingMockFactory().createRoutingPort({
    navigate,
    Outlet: () => <div data-testid="outlet-child" />,
    params: { projectId: '12' },
  });

  describe('createLink()', () => {
    it('creates a component that renders using the routing port createLink factory', () => {
      // Arrange
      const AnchorComp = ({ href, children }: { href?: string; children?: ReactNode }) => (
        <a href={href}>{children}</a>
      );
      const RoutedAnchor = createLink(AnchorComp);

      // Act
      renderWithRoutingProvider(
        <RoutedAnchor to="/workspace/dashboard">Dashboard</RoutedAnchor>,
        routingPort,
      );

      // Assert
      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/workspace/dashboard',
      );
    });
  });

  describe('Outlet()', () => {
    it('renders the configured routing outlet component', () => {
      // Arrange + Act
      renderWithRoutingProvider(<Outlet />, routingPort);

      // Assert
      expect(screen.getByTestId('outlet-child')).toBeInTheDocument();
    });
  });

  describe('usePresentationNavigate()', () => {
    it('returns the configured navigation hook result', () => {
      // Act
      const { result } = renderHookWithRoutingProvider(
        () => usePresentationNavigate(),
        routingPort,
      );
      result.current('/workspace/dashboard');

      // Assert
      expect(navigate).toHaveBeenCalledWith('/workspace/dashboard');
    });
  });

  describe('usePresentationParams()', () => {
    it('returns the configured route params result', () => {
      const { result } = renderHookWithRoutingProvider(
        () => usePresentationParams<'projectId'>(),
        routingPort,
      );

      expect(result.current.projectId).toBe('12');
    });
  });
});
