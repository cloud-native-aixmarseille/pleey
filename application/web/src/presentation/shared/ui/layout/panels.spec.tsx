import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { DashedNoticePanel, ElevatedPanel, InsetPanel, InteractivePanel } from './panels';

describe('panels', () => {
  describe('InsetPanel()', () => {
    it('renders children inside a recessed surface', () => {
      // Arrange + Act
      renderWithUiProvider(
        <InsetPanel>
          <span>Panel content</span>
        </InsetPanel>,
      );

      // Assert
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });
  });

  describe('DashedNoticePanel()', () => {
    it('renders children as supporting text inside a dashed panel', () => {
      // Arrange + Act
      renderWithUiProvider(<DashedNoticePanel>Notice text</DashedNoticePanel>);

      // Assert
      expect(screen.getByText('Notice text')).toBeInTheDocument();
    });
  });

  describe('ElevatedPanel()', () => {
    it('renders children inside an elevated surface', () => {
      // Arrange + Act
      renderWithUiProvider(
        <ElevatedPanel>
          <span>Elevated content</span>
        </ElevatedPanel>,
      );

      // Assert
      expect(screen.getByText('Elevated content')).toBeInTheDocument();
    });
  });

  describe('InteractivePanel()', () => {
    it('renders children inside an interactive surface', () => {
      // Arrange + Act
      renderWithUiProvider(
        <InteractivePanel>
          <span>Interactive content</span>
        </InteractivePanel>,
      );

      // Assert
      expect(screen.getByText('Interactive content')).toBeInTheDocument();
    });
  });
});
