import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test-utils/render-with-providers';
import {
  GlobalEmptyState,
  GlobalErrorState,
  PageIntro,
  StickyActionBar,
} from './app-shell-primitives';

describe('app-shell-primitives', () => {
  it('renders the page intro with eyebrow, title, subtitle, and actions', () => {
    renderWithProviders(
      <PageIntro
        actions={<button type="button">Create game</button>}
        eyebrow="Workspace"
        subtitle="Manage your games and sessions."
        title="Dashboard"
      />,
    );

    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Manage your games and sessions.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create game' })).toBeInTheDocument();
  });

  it('renders empty and error states with their accessible semantics', () => {
    renderWithProviders(
      <>
        <GlobalEmptyState title="No games yet" message="Create one to get started." />
        <GlobalErrorState title="Unable to load" message="Retry in a moment." />
        <StickyActionBar>
          <button type="button">Save</button>
        </StickyActionBar>
      </>,
    );

    expect(screen.getByText('No games yet')).toBeInTheDocument();
    expect(screen.getByText('Create one to get started.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load');
    expect(screen.getByRole('toolbar')).toHaveTextContent('Save');
  });
});
