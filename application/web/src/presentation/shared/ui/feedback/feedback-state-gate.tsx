import type { PropsWithChildren, ReactNode } from 'react';
import { EmptyState, LoadingState, type LoadingStateVariant, PendingState } from './state-blocks';
import { StatusBanner } from './status-banner';

export enum FeedbackState {
  EMPTY = 'empty',
  LOADING = 'loading',
  PENDING = 'pending',
  READY = 'ready',
}

interface FeedbackStateGateProps extends PropsWithChildren {
  readonly emptyLabel?: ReactNode;
  readonly errorMessage?: ReactNode;
  readonly loadingLabel?: ReactNode;
  readonly loadingVariant?: LoadingStateVariant;
  readonly pendingLabel?: ReactNode;
  readonly state: FeedbackState;
}

export function FeedbackStateGate({
  children,
  emptyLabel,
  errorMessage,
  loadingLabel,
  loadingVariant = 'list',
  pendingLabel,
  state,
}: FeedbackStateGateProps) {
  return (
    <>
      <StatusBanner tone="error">{errorMessage}</StatusBanner>
      {renderByState({
        children,
        emptyLabel,
        loadingLabel,
        loadingVariant,
        pendingLabel,
        state,
      })}
    </>
  );
}

function renderByState({
  children,
  emptyLabel,
  loadingLabel,
  loadingVariant,
  pendingLabel,
  state,
}: {
  readonly children: ReactNode;
  readonly emptyLabel?: ReactNode;
  readonly loadingLabel?: ReactNode;
  readonly loadingVariant: LoadingStateVariant;
  readonly pendingLabel?: ReactNode;
  readonly state: FeedbackState;
}) {
  switch (state) {
    case FeedbackState.PENDING:
      return <PendingState>{pendingLabel}</PendingState>;
    case FeedbackState.LOADING:
      return <LoadingState variant={loadingVariant}>{loadingLabel}</LoadingState>;
    case FeedbackState.EMPTY:
      return <EmptyState>{emptyLabel}</EmptyState>;
    default:
      return children;
  }
}
