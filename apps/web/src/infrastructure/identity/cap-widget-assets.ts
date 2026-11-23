import wasmUrl from '@cap.js/wasm/browser/cap_wasm_bg.wasm?url';
import hashwxUrl from '@cap.js/wasm/browser/hashwx.wasm?url';

declare global {
  interface Window {
    CAP_DISABLE_WIDGET_REF?: boolean;
  }
}

// The widget prefetches WASM while its module loads. Configure local assets before importing it.
window.CAP_CUSTOM_WASM_URL = wasmUrl;
window.CAP_CUSTOM_HASHWX_URL = hashwxUrl;
window.CAP_SILENT = true;
window.CAP_DISABLE_WIDGET_REF = true;
