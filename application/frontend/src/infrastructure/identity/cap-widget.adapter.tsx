import './cap-widget-assets';
import '@cap.js/widget';
import type { CapWidget } from '@cap.js/widget';
import { injectable } from 'inversify';
import { createElement, useEffect, useEffectEvent, useRef } from 'react';
import type { CaptchaWidgetPort, CaptchaWidgetProps } from '../../application/identity/ports/captcha-widget.port';
import { API_URL } from '../config/api';

function CapWidgetView({ action, labels, onTokenChange, onError }: CaptchaWidgetProps) {
  const widgetRef = useRef<CapWidget>(null);
  const updateToken = useEffectEvent(onTokenChange);
  const reportError = useEffectEvent(onError);

  useEffect(() => {
    // Cap's attribution has no i18n attribute, so localize the link at the adapter boundary.
    const attribution = widgetRef.current?.shadowRoot?.querySelector('a[href="https://trycap.dev"]');
    attribution?.setAttribute('aria-label', labels.providerLabel);
    attribution?.setAttribute('title', labels.providerLabel);
  }, [labels.providerLabel]);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;
    updateToken(null);
    function handleSolve(event: CustomEvent<{ token: string }>) {
      updateToken(event.detail.token);
    }
    function handleProgress(event: CustomEvent<{ progress: number }>) {
      if (event.detail.progress === 0) updateToken(null);
    }
    function handleReset() {
      updateToken(null);
    }
    function handleError() {
      updateToken(null);
      reportError();
    }
    widget.addEventListener('progress', handleProgress);
    widget.addEventListener('solve', handleSolve);
    widget.addEventListener('reset', handleReset);
    widget.addEventListener('error', handleError);
    return () => {
      widget.removeEventListener('progress', handleProgress);
      widget.removeEventListener('solve', handleSolve);
      widget.removeEventListener('reset', handleReset);
      widget.removeEventListener('error', handleError);
      // Disconnection aborts fetches and terminates workers in Cap itself.
      widget.reset();
    };
  }, []);

  return createElement('cap-widget', {
    ref: widgetRef,
    style: {
      display: 'block',
      width: '100%',
      maxWidth: '100%',
      '--cap-widget-width': '100%',
      '--cap-widget-padding': 'var(--mantine-spacing-xs)',
      '--cap-gap': 'var(--mantine-spacing-xs)',
      '--cap-background': 'var(--mantine-color-body)',
      '--cap-color': 'var(--mantine-color-text)',
      '--cap-border-color': 'var(--mantine-color-default-border)',
      '--cap-focus-ring': 'var(--mantine-primary-color-filled)',
    },
    'data-cap-api-endpoint': `${API_URL}/api/identity/captcha/${action}/`,
    'data-cap-disable-haptics': '',
    'data-cap-worker-count': '2',
    'data-cap-i18n-initial-state': labels.initial,
    'data-cap-i18n-verifying-label': labels.verifying,
    'data-cap-i18n-solved-label': labels.solved,
    'data-cap-i18n-error-label': labels.error,
    'data-cap-i18n-required-label': labels.required,
    'data-cap-i18n-troubleshooting-label': labels.troubleshooting,
    'data-cap-i18n-wasm-disabled': labels.wasmDisabled,
    'data-cap-i18n-group-aria-label': labels.groupAriaLabel,
    'data-cap-i18n-verify-aria-label': labels.verifyAriaLabel,
    'data-cap-i18n-verifying-aria-label': labels.verifyingAriaLabel,
    'data-cap-i18n-verified-aria-label': labels.verifiedAriaLabel,
    'data-cap-i18n-error-aria-label': labels.errorAriaLabel,
  });
}

@injectable()
export class CapWidgetAdapter implements CaptchaWidgetPort {
  readonly Widget = CapWidgetView;
}
