export type ActionPermission<Reason extends string = string> =
  | { readonly allowed: true; readonly reason: null }
  | { readonly allowed: false; readonly reason: Reason };

export type Permissions<TActions extends Record<string, string>> = {
  readonly [K in keyof TActions]: ActionPermission<TActions[K]>;
};
