import { render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RoutingMockFactory } from '../../../test-utils/factories/routing-mock-factory';
import {
  createLink,
  Outlet,
  PresentationRoutingProvider,
  usePresentationNavigate,
  usePresentationParams,
} from './router';

describe('router', () => {
  const navigate = vi.fn();
  const routingPort = new RoutingMockFactory().createRoutingPort({
    navigate,
    Outlet: () => <div data-testid="outlet-child" />,
    params: { sessionPin: 'AB12CD' },
  });

  describe('createLink()', () => {
    it('creates a component that renders using the routing port createLink factory', () => {
      // Arrange
      const AnchorComp = ({ href, children }: { href?: string; children?: ReactNode }) => (
        <a href={href}>{children}</a>
      );
      const RoutedAnchor = createLink(AnchorComp);

      // Act
      render(
        <PresentationRoutingProvider value={routingPort}>
          <RoutedAnchor to="/workspace/dashboard">Dashboard</RoutedAnchor>
        </PresentationRoutingProvider>,
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
      render(
        <PresentationRoutingProvider value={routingPort}>
          <Outlet />
        </PresentationRoutingProvider>,
      );

      // Assert
      expect(screen.getByTestId('outlet-child')).toBeInTheDocument();
    });
  });

  describe('usePresentationNavigate()', () => {
    it('returns the configured navigation hook result', () => {
      // Arrange
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PresentationRoutingProvider value={routingPort}>{children}</PresentationRoutingProvider>
      );

      // Act
      const { result } = renderHook(() => usePresentationNavigate(), { wrapper });
      result.current('/workspace/dashboard');

      // Assert
      expect(navigate).toHaveBeenCalledWith('/workspace/dashboard');
    });
  });

  describe('usePresentationParams()', () => {
    it('returns the configured route params result', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PresentationRoutingProvider value={routingPort}>{children}</PresentationRoutingProvider>
      );

      const { result } = renderHook(() => usePresentationParams<'sessionPin'>(), { wrapper });

      expect(result.current.sessionPin).toBe('AB12CD');
    });
  });
});
