import type { Project, ProjectId } from '../../../../../../domains/project/entities/project';
import { AsyncCombobox } from '../../../../../shared/ui/forms/async-combobox';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { ContentStack } from '../../../../../shared/ui/layout/containers';
import { ConfirmDialog } from '../../../../../shared/ui/overlay/confirm-dialog';
import { useWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';

interface ProjectRemovalDialogProps {
  readonly availableMigrationProjects: readonly Project[];
  readonly cancelLabel: string;
  readonly confirmDisabled: boolean;
  readonly confirmLabel: string;
  readonly description: string;
  readonly emptyLabel: string;
  readonly hasMoreMigrationProjects: boolean;
  readonly isDeletingProject: boolean;
  readonly isLoadingMigrationProjects: boolean;
  readonly isLoadingMoreMigrationProjects: boolean;
  readonly isOpen: boolean;
  readonly label: string;
  readonly loadingLabel: string;
  readonly message: string;
  readonly migrationProjectId: ProjectId | null;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly onMigrationProjectChange: (projectId: ProjectId | null) => void;
  readonly onMigrationProjectLoadMore: () => void;
  readonly onMigrationProjectSearchChange: (value: string) => void;
  readonly noResultsLabel: string;
  readonly placeholder: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly selectedMigrationProjectLabel: string | null;
  readonly title: string;
}

export function ProjectRemovalDialog({
  availableMigrationProjects,
  cancelLabel,
  confirmDisabled,
  confirmLabel,
  description,
  emptyLabel,
  hasMoreMigrationProjects,
  isDeletingProject,
  isLoadingMigrationProjects,
  isLoadingMoreMigrationProjects,
  isOpen,
  label,
  loadingLabel,
  message,
  migrationProjectId,
  onCancel,
  onConfirm,
  onMigrationProjectChange,
  onMigrationProjectLoadMore,
  onMigrationProjectSearchChange,
  noResultsLabel,
  placeholder,
  searchLabel,
  searchPlaceholder,
  selectedMigrationProjectLabel,
  title,
}: ProjectRemovalDialogProps) {
  const { projectIdentifier } = useWorkspaceDependencies();

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
      <ContentStack gap="md">
        <FieldShell description={description} id="project-migration-target" label={label}>
          <AsyncCombobox
            ariaLabel={label}
            disabled={isDeletingProject}
            emptyLabel={emptyLabel}
            hasMore={hasMoreMigrationProjects}
            id="project-migration-target"
            isLoading={isLoadingMigrationProjects}
            isLoadingMore={isLoadingMoreMigrationProjects}
            loadingLabel={loadingLabel}
            noResultsLabel={noResultsLabel}
            onChange={(value) => {
              onMigrationProjectChange(projectIdentifier.parseOrNull(value ?? ''));
            }}
            onLoadMore={onMigrationProjectLoadMore}
            onSearchChange={onMigrationProjectSearchChange}
            options={availableMigrationProjects.map((project) => ({
              value: String(project.id),
              label: project.name,
            }))}
            placeholder={placeholder}
            searchAriaLabel={searchLabel}
            searchPlaceholder={searchPlaceholder}
            selectedLabel={selectedMigrationProjectLabel}
            value={migrationProjectId === null ? null : String(migrationProjectId)}
          />
        </FieldShell>
      </ContentStack>
    </ConfirmDialog>
  );
}
