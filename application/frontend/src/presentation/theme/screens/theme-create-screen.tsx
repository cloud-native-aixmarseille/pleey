import type { OrganizationId } from '../../../domains/organization/entities/organization';
import { CURATED_THEME_IDS } from '../../../domains/theme/entities/theme-id';
import { usePresentationNavigate, usePresentationParams } from '../../shared/routing/router';
import { ThemeBuilderForm } from '../components/theme-builder-form';

export default function ThemeCreateScreen({ organizationId }: { readonly organizationId: OrganizationId }) {
  const navigate = usePresentationNavigate();
  const { baseThemeId } = usePresentationParams<'baseThemeId'>();
  const starter = CURATED_THEME_IDS.find((id) => id === baseThemeId) ?? 'cyber-arcade';
  const backToLibrary = () => navigate(`/workspace/organizations/${organizationId}/themes`);
  return (
    <ThemeBuilderForm
      organizationId={organizationId}
      theme={null}
      starter={starter}
      onCancel={backToLibrary}
      onSaved={(saved) =>
        navigate(`/workspace/organizations/${organizationId}/themes/${encodeURIComponent(saved.id)}/edit`, {
          replace: true,
        })
      }
    />
  );
}
