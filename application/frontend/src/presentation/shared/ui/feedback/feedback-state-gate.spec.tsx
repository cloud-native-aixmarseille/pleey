import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { FeedbackState, FeedbackStateGate } from './feedback-state-gate';

describe('FeedbackStateGate', () => {
  it('renders pending state when requested', () => {
    renderWithUiProvider(
      <FeedbackStateGate pendingLabel="Select a project first" state={FeedbackState.PENDING}>
        <div>Content</div>
      </FeedbackStateGate>,
    );

    expect(screen.getByText('Select a project first')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders loading state when requested', () => {
    renderWithUiProvider(
      <FeedbackStateGate loadingLabel="Loading..." state={FeedbackState.LOADING}>
        <div>Content</div>
      </FeedbackStateGate>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders empty state when requested', () => {
    renderWithUiProvider(
      <FeedbackStateGate emptyLabel="No games" state={FeedbackState.EMPTY}>
        <div>Content</div>
      </FeedbackStateGate>,
    );

    expect(screen.getByText('No games')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders content when state is ready', () => {
    renderWithUiProvider(
      <FeedbackStateGate state={FeedbackState.READY}>
        <div>Content</div>
      </FeedbackStateGate>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders an error banner when errorMessage is provided', () => {
    renderWithUiProvider(
      <FeedbackStateGate errorMessage="Something failed" state={FeedbackState.READY}>
        <div>Content</div>
      </FeedbackStateGate>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
  });
});
