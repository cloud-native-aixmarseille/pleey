import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createOutletRoute, renderRouteWithProviders } from '../../../test-utils/render-route-with-providers';
import { AppShellLayout } from './app-shell-layout';

vi.mock('../i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

function renderLayout(loadAppVersion?: () => Promise<string>) {
  return renderRouteWithProviders({
    routes: createOutletRoute(<AppShellLayout loadAppVersion={loadAppVersion} />, <div data-testid="outlet-content" />),
  });
}

describe('AppShellLayout', () => {
  describe('render()', () => {
    it('renders the brand as a link to home', () => {
      renderLayout();
      const brand = screen.getByRole('link', { name: 'shared.shell.kicker' });
      expect(brand).toBeInTheDocument();
      expect(brand).toHaveAttribute('href', '/');
    });

    it('does not render the auth link (sign-in handled by account menu)', () => {
      renderLayout();
      expect(screen.queryByRole('link', { name: 'shared.nav.auth' })).not.toBeInTheDocument();
    });

    it('does not render the dashboard link when not authenticated', () => {
      renderLayout();
      expect(screen.queryByRole('link', { name: 'shared.nav.dashboard' })).not.toBeInTheDocument();
    });

    it('renders child route content via Outlet', () => {
      renderLayout();
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    });

    it('renders the mobile navigation burger', () => {
      renderLayout();
      expect(screen.getByRole('button', { name: 'shared.shell.navToggle' })).toBeInTheDocument();
    });

    it('labels the navigation landmark for accessibility', () => {
      renderLayout();
      expect(screen.getByRole('navigation', { name: 'shared.shell.navLabel' })).toBeInTheDocument();
    });

    it('loads the deployed version from the backend', async () => {
      const loadAppVersion = vi.fn().mockResolvedValue('1.2.3');

      renderLayout(loadAppVersion);

      await waitFor(() => {
        expect(loadAppVersion).toHaveBeenCalledTimes(1);
      });
    });

    it('does not render the deployed version in the page body when the backend returns a value', async () => {
      const loadAppVersion = vi.fn().mockResolvedValue('1.2.3');

      renderLayout(loadAppVersion);

      await waitFor(() => {
        expect(loadAppVersion).toHaveBeenCalledTimes(1);
      });

      expect(screen.queryByText('shared.shell.version (version=1.2.3)')).not.toBeInTheDocument();
    });

    it('does not render the deployed version when the backend returns an empty value', async () => {
      const loadAppVersion = vi.fn().mockResolvedValue('  ');

      renderLayout(loadAppVersion);

      await waitFor(() => {
        expect(loadAppVersion).toHaveBeenCalledTimes(1);
      });

      expect(screen.queryByText(/shared\.shell\.version/i)).not.toBeInTheDocument();
    });

    it('does not render the deployed version when loading fails', async () => {
      const loadAppVersion = vi.fn().mockRejectedValue(new Error('boom'));

      renderLayout(loadAppVersion);

      await waitFor(() => {
        expect(loadAppVersion).toHaveBeenCalledTimes(1);
      });

      expect(screen.queryByText(/shared\.shell\.version/i)).not.toBeInTheDocument();
    });
  });
});
