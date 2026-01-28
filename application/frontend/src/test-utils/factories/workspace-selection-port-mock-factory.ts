import { vi } from 'vitest';
import type {
  WorkspaceSelection,
  WorkspaceSelectionPort,
} from '../../application/workspace/contracts/workspace-selection.port';

export class WorkspaceSelectionPortMockFactory {
  create(
    overrides: Partial<WorkspaceSelectionPort> = {},
    selection: WorkspaceSelection = { organizationId: null, projectId: null },
  ): WorkspaceSelectionPort {
    return {
      restoreSelection: vi.fn(() => selection),
      setOrganizationId: vi.fn(),
      setProjectId: vi.fn(),
      clear: vi.fn(),
      ...overrides,
    };
  }
}
