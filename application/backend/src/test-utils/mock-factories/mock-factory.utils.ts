import { type Mock, vi } from 'vitest';

type AnyFn = (...args: never[]) => unknown;

type AsyncMethodKeys<T> = {
  [K in keyof T]-?: T[K] extends (...args: never[]) => Promise<unknown> ? K : never;
}[keyof T];

type SyncMethodKeys<T> = {
  [K in keyof T]-?: T[K] extends (...args: never[]) => infer R
    ? R extends Promise<unknown>
      ? never
      : K
    : never;
}[keyof T];

type ResolvedValueFor<T, K extends AsyncMethodKeys<T>> = Awaited<ReturnType<Extract<T[K], AnyFn>>>;

type ReturnedValueFor<T, K extends SyncMethodKeys<T>> = ReturnType<Extract<T[K], AnyFn>>;

type MockFactoryOptions<T> = {
  resolved?: Array<AsyncMethodKeys<T>>;
  returned?: Array<SyncMethodKeys<T>>;
};

type MockFactoryValues<T> = Partial<
  {
    [K in AsyncMethodKeys<T>]: ResolvedValueFor<T, K>;
  } & {
    [K in SyncMethodKeys<T>]: ReturnedValueFor<T, K>;
  }
>;

export type MockFactoryConfig<T> = MockFactoryOptions<T> & MockFactoryValues<T>;

export type MockFactoryMethodKinds<T> = {
  resolved: ReadonlyArray<AsyncMethodKeys<T>>;
  returned: ReadonlyArray<SyncMethodKeys<T>>;
};

export const mockFn = <T extends AnyFn>(): Mock<T> => vi.fn<T>();

type ResolvableMock = { mockResolvedValue: (value: unknown) => unknown };
type ReturnableMock = { mockReturnValue: (value: unknown) => unknown };

const hasMockResolvedValue = (value: unknown): value is ResolvableMock =>
  typeof (value as ResolvableMock)?.mockResolvedValue === 'function';

const hasMockReturnValue = (value: unknown): value is ReturnableMock =>
  typeof (value as ReturnableMock)?.mockReturnValue === 'function';

const applyMockFactoryOptions = <T extends object>(
  mock: T,
  options: MockFactoryOptions<T> = {},
): void => {
  const record = mock as Record<string, unknown>;

  if (options.resolved) {
    for (const key of options.resolved) {
      const fn = record[key as string];
      if (hasMockResolvedValue(fn)) {
        fn.mockResolvedValue(undefined as ResolvedValueFor<T, typeof key>);
      }
    }
  }

  if (options.returned) {
    for (const key of options.returned) {
      const fn = record[key as string];
      if (hasMockReturnValue(fn)) {
        fn.mockReturnValue(undefined as ReturnedValueFor<T, typeof key>);
      }
    }
  }
};

export const applyMockFactoryConfig = <T extends object>(
  mock: T,
  config: MockFactoryConfig<T> = {},
  methodKinds: MockFactoryMethodKinds<T>,
): void => {
  applyMockFactoryOptions(mock, config);

  const record = mock as Record<string, unknown>;

  for (const [rawKey, value] of Object.entries(config)) {
    if (rawKey === 'resolved' || rawKey === 'returned') continue;

    const key = rawKey as keyof T;
    const fn = record[rawKey];

    if (!fn) continue;

    if (
      (methodKinds.resolved as ReadonlyArray<keyof T>).includes(key) &&
      hasMockResolvedValue(fn)
    ) {
      fn.mockResolvedValue(value);
      continue;
    }

    if ((methodKinds.returned as ReadonlyArray<keyof T>).includes(key) && hasMockReturnValue(fn)) {
      fn.mockReturnValue(value);
    }
  }
};
