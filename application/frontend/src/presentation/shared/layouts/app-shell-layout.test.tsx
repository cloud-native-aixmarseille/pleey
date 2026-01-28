import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  createOutletRoute,
  renderRouteWithProviders,
} from '../../../test-utils/render-route-with-providers';
import { renderWithUiProvider } from '../../../test-utils/render-with-ui-provider';
import {
  AppShellLayout,
  GlobalEmptyState,
  GlobalErrorState,
  PageIntro,
  StickyActionBar,
} from './app-shell-layout';

vi.mock('../i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

function renderLayout() {
  return renderRouteWithProviders({
    routes: createOutletRoute(<AppShellLayout />, <div data-testid="outlet-content" />),
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

    it('renders the navigation link to the game route', () => {
      renderLayout();
      expect(screen.getByRole('link', { name: 'shared.nav.game' })).toBeInTheDocument();
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
  });
});

describe('PageIntro', () => {
  it('renders title as h1 by default', () => {
    renderWithUiProvider(<PageIntro title="Dashboard" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders title as h2 when level=2', () => {
    renderWithUiProvider(<PageIntro level={2} title="Quizzes" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Quizzes' })).toBeInTheDocument();
  });

  it('renders eyebrow, subtitle, and actions when provided', () => {
    renderWithUiProvider(
      <PageIntro
        actions={<button type="button">Create</button>}
        eyebrow="Admin"
        subtitle="Manage your quizzes"
        title="Quiz Library"
      />,
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Manage your quizzes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});

describe('StickyActionBar', () => {
  it('renders children inside a toolbar', () => {
    renderWithUiProvider(
      <StickyActionBar>
        <button type="button">Save</button>
      </StickyActionBar>,
    );
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});

describe('GlobalEmptyState', () => {
  it('renders title and optional message', () => {
    renderWithUiProvider(
      <GlobalEmptyState message="Create one to get started." title="No quizzes yet" />,
    );
    expect(screen.getByText('No quizzes yet')).toBeInTheDocument();
    expect(screen.getByText('Create one to get started.')).toBeInTheDocument();
  });

  it('renders optional actions', () => {
    renderWithUiProvider(
      <GlobalEmptyState actions={<button type="button">Add</button>} title="Empty" />,
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });
});

describe('GlobalErrorState', () => {
  it('renders as an alert with title and message', () => {
    renderWithUiProvider(
      <GlobalErrorState message="Please try again." title="Something went wrong" />,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please try again.')).toBeInTheDocument();
  });
});
