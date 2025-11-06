import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Button,
  Card,
  Container,
  Input,
} from "../../../shared/components";
import type { User } from "../../../shared/types";

interface ProfilePageProps {
  user: User;
  onSubmit: (updates: { username: string; email: string }) => Promise<void>;
  onRegenerateAvatar: () => Promise<void>;
  onLogout: () => void;
  onBack?: () => void;
  isSaving?: boolean;
}

export default function ProfilePage({
  user,
  onSubmit,
  onRegenerateAvatar,
  onLogout,
  onBack,
  isSaving = false,
}: ProfilePageProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    setUsername(user.username);
    setEmail(user.email);
  }, [user]);

  const isDirty = useMemo(() => {
    return username !== user.username || email !== user.email;
  }, [email, user.email, user.username, username]);

  const disableSave = isSaving || isSubmitting || !isDirty;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDirty) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        username: username.trim(),
        email: email.trim(),
      });
    } catch (error) {
      // Parent handles error feedback via notifications.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateAvatar = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateAvatar();
    } catch (error) {
      // Parent handles error feedback via notifications.
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(t("profile.logoutConfirm"))) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-8">
      <Container size="md">
        <Card className="p-6 sm:p-10 space-y-8 animate-fade-in">
          {onBack && (
            <div className="flex justify-start">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-light-600 hover:text-light-200"
              >
                {t("profile.backToDashboard")}
              </Button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={user.username} src={user.avatarUrl} size="lg" />
              <div>
                <p className="text-sm text-light-600 uppercase tracking-wide">
                  {t("profile.viewingAs")}
                </p>
                <h1 className="text-3xl font-black text-gradient-neon">
                  {user.username}
                </h1>
                <p className="text-light-700">{t("profile.subtitle")}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleRegenerateAvatar}
                disabled={isSaving || isRegenerating}
                className="w-full sm:w-auto"
              >
                {isRegenerating
                  ? t("common.loading")
                  : t("profile.regenerateAvatar")}
              </Button>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                {t("common.logout")}
              </Button>
            </div>
          </div>

          <p className="text-xs text-light-600">
            {t("profile.avatarManagedBySystem")}
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label={t("profile.username")}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={t("profile.username") ?? ""}
                required
                minLength={3}
                maxLength={32}
              />

              <Input
                label={t("profile.email")}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <Button
                type="submit"
                variant="primary"
                disabled={disableSave}
                className="sm:w-auto"
              >
                {disableSave ? t("common.loading") : t("profile.save")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setUsername(user.username);
                  setEmail(user.email);
                }}
                disabled={!isDirty || isSaving || isSubmitting}
                className="text-light-600 hover:text-light-800"
              >
                {t("profile.cancel")}
              </Button>
            </div>
          </form>
        </Card>
      </Container>
    </div>
  );
}
