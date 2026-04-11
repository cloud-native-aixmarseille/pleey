import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  MemoryRouter,
  Outlet as ReactRouterOutlet,
  useNavigate as useReactRouterNavigate,
} from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ReactRouterRoutingAdapter } from './react-router-routing.adapter';

describe('ReactRouterRoutingAdapter', () => {
  describe('createPort()', () => {
    it('returns a port with createLink, Outlet, and useNavigate bindings', () => {
      // Arrange
      const adapter = new ReactRouterRoutingAdapter();

      // Act
      const port = adapter.createPort();

      // Assert
      const RoutedAnchor = port.createLink<{
        readonly href?: string;
        readonly children?: React.ReactNode;
      }>(({ href, children }) => <a href={href}>{children}</a>);

      expect(RoutedAnchor).toBeDefined();
      expect(port.Outlet).toBe(ReactRouterOutlet);
      expect(port.useNavigate).toBe(useReactRouterNavigate);
    });

    it('createLink produces a component that renders the wrapped component with routing href', () => {
      // Arrange
      const port = new ReactRouterRoutingAdapter().createPort();
      const CustomAnchor = ({ href, children }: { href?: string; children?: React.ReactNode }) => (
        <a href={href}>{children}</a>
      );
      const RoutedAnchor = port.createLink(CustomAnchor);

      // Act
      render(
        <MemoryRouter>
          <RoutedAnchor to="/workspace/dashboard">Dashboard</RoutedAnchor>
        </MemoryRouter>,
      );

      // Assert
      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/workspace/dashboard',
      );
    });
  });
});
