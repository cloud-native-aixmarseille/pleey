import { vi } from "vitest";

export const createUseTimerMock = () => ({
  useTimer: vi.fn(),
});
