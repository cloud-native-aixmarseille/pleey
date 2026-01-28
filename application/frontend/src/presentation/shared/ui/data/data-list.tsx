import type { ReactNode } from 'react';
import { EmptyState, LoadingState, PendingState } from '../feedback/state-blocks';
import { ContentStack } from '../layout/containers';

interface DataListProps<T> {
  readonly items: readonly T[];
  readonly isLoading: boolean;
  readonly isPending: boolean;
  readonly pendingMessage: string;
  readonly loadingMessage: string;
  readonly emptyMessage: string;
  readonly renderItem: (item: T, index: number) => ReactNode;
  readonly keyExtractor: (item: T) => string | number;
  readonly gap?: 'xs' | 'sm' | 'md' | 'lg';
}

export function DataList<T>({
  items,
  isLoading,
  isPending,
  pendingMessage,
  loadingMessage,
  emptyMessage,
  renderItem,
  keyExtractor,
  gap = 'md',
}: DataListProps<T>) {
  if (isPending) {
    return <PendingState>{pendingMessage}</PendingState>;
  }

  if (isLoading) {
    return <LoadingState variant="list">{loadingMessage}</LoadingState>;
  }

  if (items.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <ContentStack gap={gap}>
      {items.map((item, index) => (
        <DataListItem key={keyExtractor(item)}>{renderItem(item, index)}</DataListItem>
      ))}
    </ContentStack>
  );
}

function DataListItem({ children }: { readonly children: ReactNode }) {
  return <>{children}</>;
}
