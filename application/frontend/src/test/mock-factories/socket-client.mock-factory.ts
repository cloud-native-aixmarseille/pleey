import { vi } from "vitest";

export type SocketClientMock = {
  emit: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
};

export const createSocketClientMock = (): SocketClientMock => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
});
