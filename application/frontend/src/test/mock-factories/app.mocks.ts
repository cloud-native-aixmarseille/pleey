import { vi } from "vitest";
import { createContainerMock } from "./container.mock-factory";

type AppMocks = {
  authRepositoryMock: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    getCurrentUser: ReturnType<typeof vi.fn>;
    updateProfile: ReturnType<typeof vi.fn>;
    regenerateAvatar: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  organizationRepositoryMock: {
    getMyOrganizations: ReturnType<typeof vi.fn>;
    getOrganizationDashboard: ReturnType<typeof vi.fn>;
    createOrganization: ReturnType<typeof vi.fn>;
  };
};

const appMocksState: AppMocks = vi.hoisted(() => ({
  authRepositoryMock: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
    regenerateAvatar: vi.fn(),
    logout: vi.fn(),
  },
  organizationRepositoryMock: {
    getMyOrganizations: vi.fn(),
    getOrganizationDashboard: vi.fn(),
    createOrganization: vi.fn(),
  },
}));

export const getAppMocks = () => appMocksState;

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

vi.mock("../../app/di/container", async () => {
  return {
    container: createContainerMock({
      authRepository: appMocksState.authRepositoryMock,
      organizationRepository: appMocksState.organizationRepositoryMock,
    }),
  };
});

export const resetAppMocks = () => {
  for (const value of Object.values(appMocksState.authRepositoryMock)) {
    value.mockClear();
  }
  for (const value of Object.values(appMocksState.organizationRepositoryMock)) {
    value.mockClear();
  }
};
