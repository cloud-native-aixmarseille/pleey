import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { MetricPanel } from './metric-panel';

describe('MetricPanel', () => {
  it('renders the numeric value and label', () => {
    renderWithUiProvider(<MetricPanel label="Total games" value={42} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total games')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    renderWithUiProvider(<MetricPanel label="Status" value="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders zero values correctly', () => {
    renderWithUiProvider(<MetricPanel label="Empty metric" value={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
