import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Container } from "../../../../../presentation/shared/ui/components";
import type { User } from "../../../../../domains/auth/types";

import { ProfileLayout } from "./components/ProfileLayout.tsx";
import { ProfileCard } from "./components/ProfileCard.tsx";
import { ProfileHeader } from "./components/ProfileHeader.tsx";
import { ProfileForm } from "./components/ProfileForm.tsx";

const AVATAR_NOTE_CLASSES = "text-xs text-light-600";

interface ProfilePageProps {
  user: User;
  onSubmit: (updates: { username: string; email: string }) => Promise<void>;
  onRegenerateAvatar: () => Promise<void>;
  onBack?: () => void;
  isSaving?: boolean;
}

export function ProfilePage({
  user,
  onSubmit,
  onRegenerateAvatar,
  onBack,
  isSaving = false,
}: ProfilePageProps) {
  const { t } = useTranslation();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const viewingAsLabel = useMemo(() => t("profile.viewingAs"), [t]);
  const profileSubtitle = useMemo(() => t("profile.subtitle"), [t]);
  const backLabel = useMemo(() => t("profile.backToDashboard"), [t]);
  const loadingLabel = useMemo(() => t("common.loading"), [t]);
  const regenerateLabel = useMemo(() => t("profile.regenerateAvatar"), [t]);

  const handleRegenerateAvatar = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateAvatar();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <ProfileLayout>
      <Container size="md">
        <ProfileCard onBack={onBack} backLabel={backLabel}>
          <ProfileHeader
            user={user}
            viewingAsLabel={viewingAsLabel}
            subtitle={profileSubtitle}
            regenerateLabel={regenerateLabel}
            loadingLabel={loadingLabel}
            onRegenerate={handleRegenerateAvatar}
            disableRegenerate={isSaving || isRegenerating}
            isRegenerating={isRegenerating}
          />

          <p className={AVATAR_NOTE_CLASSES}>
            {t("profile.avatarManagedBySystem")}
          </p>

          <ProfileForm
            user={user}
            emailPlaceholder={t("profile.emailPlaceholder")}
            usernameLabel={t("profile.username")}
            emailLabel={t("profile.email")}
            saveLabel={t("profile.save")}
            cancelLabel={t("profile.cancel")}
            loadingLabel={loadingLabel}
            onSubmit={onSubmit}
            isSaving={isSaving}
          />
        </ProfileCard>
      </Container>
    </ProfileLayout>
  );
}
