export class RuntimeContainerMockFactory {
  createModule(getMock: (...args: unknown[]) => unknown) {
    return {
      runtimeContainer: {
        get: (...args: unknown[]) => getMock(...args),
      },
    };
  }
}
