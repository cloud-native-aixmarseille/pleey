import 'reflect-metadata';
import '@testing-library/jest-dom';
import { configure, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

function createMemoryStorage() {
  const store = new Map();

  return {
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
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
}

function installStorageGlobal(target, property, value) {
  Object.defineProperty(target, property, {
    configurable: true,
    value,
  });
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
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  installStorageGlobal(window, 'localStorage', localStorageMock);
  installStorageGlobal(window, 'sessionStorage', sessionStorageMock);
  installStorageGlobal(globalThis, 'localStorage', localStorageMock);
  installStorageGlobal(globalThis, 'sessionStorage', sessionStorageMock);

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });

  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}