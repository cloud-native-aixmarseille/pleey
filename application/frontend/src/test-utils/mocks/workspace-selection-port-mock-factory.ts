import { vi } from 'vitest';
import type {
  WorkspaceSelection,
  WorkspaceSelectionPort,
} from '../../application/workspace/contracts/workspace-selection.port';

const EMPTY_WORKSPACE_SELECTION: WorkspaceSelection = {
  organizationId: null,
  projectId: null,
};

export class WorkspaceSelectionPortMockFactory {
  create(
    overrides: Partial<WorkspaceSelectionPort> = {},
    selection: WorkspaceSelection = EMPTY_WORKSPACE_SELECTION,
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
