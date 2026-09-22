import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';
import { CaptchaWidgetMockFactory } from '../../../test-utils/mocks/captcha-widget-mock-factory';
import { CaptchaProvider, useCaptchaWidget } from './captcha-context';

describe('CaptchaContext', () => {
  it('provides the injected CAPTCHA widget', () => {
    // Arrange
    const widget = new CaptchaWidgetMockFactory().create();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CaptchaProvider value={widget}>{children}</CaptchaProvider>
    );
    // Act
    const { result } = renderHook(() => useCaptchaWidget(), { wrapper });
    // Assert
    expect(result.current).toBe(widget);
  });

  it('fails closed when the CAPTCHA provider is absent', () => {
    // Arrange + Act
    const renderWithoutProvider = () => renderHook(() => useCaptchaWidget());
    // Assert
    expect(renderWithoutProvider).toThrow(
      PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED,
    );
  });
});
