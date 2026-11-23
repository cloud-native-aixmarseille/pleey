import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { authEn } from '../../presentation/identity/i18n/en';
import { CapWidgetBrowserMockFactory } from '../../test-utils/mocks/cap-widget-browser-mock-factory';
import { CapWidgetAdapter } from './cap-widget.adapter';

const assetConfigAtImport = vi.hoisted(() => ({ wasm: '', hashwx: '' }));
vi.mock('@cap.js/widget', () => {
  assetConfigAtImport.wasm = window.CAP_CUSTOM_WASM_URL ?? '';
  assetConfigAtImport.hashwx = window.CAP_CUSTOM_HASHWX_URL ?? '';
  return {};
});

describe('CapWidgetAdapter', () => {
  it('uses the local action endpoint and locally bundled solver assets', () => {
    // Arrange
    new CapWidgetBrowserMockFactory().register();
    const { Widget } = new CapWidgetAdapter();
    // Act
    const { container } = render(
      <Widget action="signup" labels={authEn.auth.captcha} onTokenChange={vi.fn()} onError={vi.fn()} />,
    );
    // Assert
    expect(container.querySelector('cap-widget')).toHaveAttribute(
      'data-cap-api-endpoint',
      expect.stringMatching(/\/api\/identity\/captcha\/signup\/$/),
    );
    expect(assetConfigAtImport.wasm).toBe(window.CAP_CUSTOM_WASM_URL);
    expect(assetConfigAtImport.wasm).not.toBe('');
    expect(window.CAP_CUSTOM_WASM_URL).not.toMatch(/^https?:/);
    expect(assetConfigAtImport.hashwx).toBe(window.CAP_CUSTOM_HASHWX_URL);
    expect(assetConfigAtImport.hashwx).not.toBe('');
    expect(window.CAP_CUSTOM_HASHWX_URL).not.toMatch(/^https?:/);
    expect(container.querySelector('cap-widget')).toHaveAttribute(
      'data-cap-i18n-verify-aria-label',
      'Complete the security check',
    );
  });

  it('clears a token when the widget expires and rejects late events after unmount', () => {
    // Arrange
    new CapWidgetBrowserMockFactory().register();
    const onTokenChange = vi.fn();
    const { Widget } = new CapWidgetAdapter();
    const { container, unmount } = render(
      <Widget
        action="password-recovery"
        labels={authEn.auth.captcha}
        onTokenChange={onTokenChange}
        onError={vi.fn()}
      />,
    );
    const widget = container.querySelector('cap-widget');
    // Act
    act(() => widget?.dispatchEvent(new CustomEvent('solve', { detail: { token: 'solved-token' } })));
    act(() => widget?.dispatchEvent(new CustomEvent('reset')));
    unmount();
    widget?.dispatchEvent(new CustomEvent('solve', { detail: { token: 'late-token' } }));
    // Assert
    expect(onTokenChange.mock.calls.map(([token]) => token)).toEqual([null, 'solved-token', null]);
  });

  it('invalidates verification and reports network or solver failures', () => {
    // Arrange
    new CapWidgetBrowserMockFactory().register();
    const onTokenChange = vi.fn();
    const onError = vi.fn();
    const { Widget } = new CapWidgetAdapter();
    const { container } = render(
      <Widget action="signup" labels={authEn.auth.captcha} onTokenChange={onTokenChange} onError={onError} />,
    );
    // Act
    act(() => container.querySelector('cap-widget')?.dispatchEvent(new CustomEvent('error')));
    // Assert
    expect(onTokenChange).toHaveBeenLastCalledWith(null);
    expect(onError).toHaveBeenCalledOnce();
  });
});
