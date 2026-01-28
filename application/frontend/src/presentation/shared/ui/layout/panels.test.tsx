import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { DashedNoticePanel, InsetPanel } from './panels';

describe('panels', () => {
  describe('InsetPanel()', () => {
    it('renders children inside a recessed surface', () => {
      renderWithUiProvider(
        <InsetPanel>
          <span>Panel content</span>
        </InsetPanel>,
      );

      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });
  });

  describe('DashedNoticePanel()', () => {
    it('renders children as supporting text inside a dashed panel', () => {
      renderWithUiProvider(<DashedNoticePanel>Notice text</DashedNoticePanel>);

      expect(screen.getByText('Notice text')).toBeInTheDocument();
    });
  });
});
