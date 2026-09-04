import 'reflect-metadata';
import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key) ?? null : null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    get length() {
      return store.size;
    },
  };
};

const installStorageGlobal = (
  target: object,
  property: 'localStorage' | 'sessionStorage',
  value: Storage,
): void => {
  Object.defineProperty(target, property, {
    configurable: true,
    value,
  });
};

const createMatchMedia = (query: string): MediaQueryList =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    addListener: () => {},
    removeListener: () => {},
  }) as MediaQueryList;

class ResizeObserverStub implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}

  disconnect(): void {}

  observe(_target: Element, _options?: ResizeObserverOptions): void {}

  unobserve(_target: Element): void {}
}

const localStorageMock = createMemoryStorage();
const sessionStorageMock = createMemoryStorage();

configure({
  asyncUtilTimeout: 5000,
});

if (!i18n.isInitialized) {
  await i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    lng: 'en',
    parseMissingKeyHandler: (key) => key,
    resources: {
      en: {
        translation: {},
      },
    },
    returnEmptyString: false,
  });
}

afterEach(() => {
  cleanup();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

if (typeof window !== 'undefined') {
  const reactActEnvironment = globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  };

  reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

  installStorageGlobal(window, 'localStorage', localStorageMock);
  installStorageGlobal(window, 'sessionStorage', sessionStorageMock);
  installStorageGlobal(globalThis, 'localStorage', localStorageMock);
  installStorageGlobal(globalThis, 'sessionStorage', sessionStorageMock);

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: createMatchMedia,
  });

  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = ResizeObserverStub;
  }
}