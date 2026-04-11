import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { DataList } from './data-list';

interface TestItem {
  readonly id: number;
  readonly name: string;
}

const items: TestItem[] = [
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' },
  { id: 3, name: 'Gamma' },
];

describe('DataList', () => {
  it('renders pending state when isPending is true', () => {
    renderWithUiProvider(
      <DataList
        items={[]}
        isLoading={false}
        isPending={true}
        pendingMessage="Select a project first."
        loadingMessage="Loading…"
        emptyMessage="No items."
        renderItem={(item: TestItem) => <span>{item.name}</span>}
        keyExtractor={(item: TestItem) => item.id}
      />,
    );

    expect(screen.getByText('Select a project first.')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    renderWithUiProvider(
      <DataList
        items={[]}
        isLoading={true}
        isPending={false}
        pendingMessage="Select a project."
        loadingMessage="Loading items…"
        emptyMessage="No items."
        renderItem={(item: TestItem) => <span>{item.name}</span>}
        keyExtractor={(item: TestItem) => item.id}
      />,
    );

    expect(screen.getByText('Loading items…')).toBeInTheDocument();
  });

  it('renders empty state when items array is empty', () => {
    renderWithUiProvider(
      <DataList
        items={[]}
        isLoading={false}
        isPending={false}
        pendingMessage="Select a project."
        loadingMessage="Loading…"
        emptyMessage="Nothing here yet."
        renderItem={(item: TestItem) => <span>{item.name}</span>}
        keyExtractor={(item: TestItem) => item.id}
      />,
    );

    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('renders items when available', () => {
    renderWithUiProvider(
      <DataList
        items={items}
        isLoading={false}
        isPending={false}
        pendingMessage="Select a project."
        loadingMessage="Loading…"
        emptyMessage="No items."
        renderItem={(item: TestItem) => <span>{item.name}</span>}
        keyExtractor={(item: TestItem) => item.id}
      />,
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('prioritizes pending over loading', () => {
    renderWithUiProvider(
      <DataList
        items={items}
        isLoading={true}
        isPending={true}
        pendingMessage="Pending wins."
        loadingMessage="Loading loses."
        emptyMessage="No items."
        renderItem={(item: TestItem) => <span>{item.name}</span>}
        keyExtractor={(item: TestItem) => item.id}
      />,
    );

    expect(screen.getByText('Pending wins.')).toBeInTheDocument();
    expect(screen.queryByText('Loading loses.')).not.toBeInTheDocument();
  });

  it('does not render items when loading', () => {
    renderWithUiProvider(
      <DataList
        items={items}
        isLoading={true}
        isPending={false}
        pendingMessage="Pending."
        loadingMessage="Loading…"
        emptyMessage="Empty."
        renderItem={(item: TestItem) => <span>{item.name}</span>}
        keyExtractor={(item: TestItem) => item.id}
      />,
    );

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});
