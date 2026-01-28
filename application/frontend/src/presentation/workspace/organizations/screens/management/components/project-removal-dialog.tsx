import type { Project } from '../../../../../../domains/project/entities/project';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Select } from '../../../../../shared/ui/forms/select';
import { ConfirmDialog } from '../../../../../shared/ui/overlay/confirm-dialog';

interface ProjectRemovalDialogProps {
  readonly availableMigrationProjects: readonly Project[];
  readonly cancelLabel: string;
  readonly confirmDisabled: boolean;
  readonly confirmLabel: string;
  readonly description: string;
  readonly isDeletingProject: boolean;
  readonly isOpen: boolean;
  readonly label: string;
  readonly message: string;
  readonly migrationProjectId: number | null;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly onMigrationProjectChange: (projectId: number | null) => void;
  readonly placeholder: string;
  readonly title: string;
}

export function ProjectRemovalDialog({
  availableMigrationProjects,
  cancelLabel,
  confirmDisabled,
  confirmLabel,
  description,
  isOpen,
  label,
  message,
  migrationProjectId,
  onCancel,
  onConfirm,
  onMigrationProjectChange,
  placeholder,
  title,
}: ProjectRemovalDialogProps) {
  return (
    <ConfirmDialog
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      isOpen={isOpen}
      message={message}
      confirmDisabled={confirmDisabled}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={title}
    >
      {availableMigrationProjects.length > 0 ? (
        <FieldShell description={description} id="project-migration-target" label={label}>
          <Select
            id="project-migration-target"
            onChange={(event) => {
              const value = event.currentTarget.value;
              onMigrationProjectChange(value ? Number(value) : null);
            }}
            value={migrationProjectId === null ? '' : String(migrationProjectId)}
          >
            <option value="">{placeholder}</option>
            {availableMigrationProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </FieldShell>
      ) : null}
    </ConfirmDialog>
  );
}
