interface ActionPermission<Reason extends string = string> {
  readonly allowed: boolean;
  readonly reason: Reason | null;
}

export type Permissions<TActions extends Record<string, string>> = {
  readonly [K in keyof TActions]: ActionPermission<TActions[K]>;
};
