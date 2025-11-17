import React, { useEffect, useRef, useState } from "react";
import { useOrganization } from "../../context/OrganizationContext";
import { useTranslation } from "react-i18next";
import Button from "../button/Button";
import SecondaryButton from "../button/SecondaryButton";
import Card from "../Card";
import { Icon } from "../../ui/icons";
import { useNotifications } from "../../../application/app/hooks/useNotifications";

/**
 * Organization Selector Component
 * Allows users to switch between organizations and create new ones
 */
export function OrganizationSelector() {
  const { t } = useTranslation();
  const {
    organizations,
    currentOrganization,
    setCurrentOrganization,
    createOrganization,
    isLoading,
  } = useOrganization();
  const { notifyFromError } = useNotifications();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showCreateForm) {
      return;
    }

    nameInputRef.current?.focus({ preventScroll: true });
  }, [showCreateForm]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsCreating(true);
    try {
      const newOrg = await createOrganization(newOrgName, newOrgDescription);
      setCurrentOrganization(newOrg);
      setShowCreateForm(false);
      setNewOrgName("");
      setNewOrgDescription("");
    } catch (error) {
      notifyFromError(error, "organization.errors.createFailed");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-light-700">
        <div className="animate-spin">⚙️</div>
        <span>{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Current Organization Display */}
      <Card
        surface="panel"
        tone="primary"
        padding="sm"
        elevation="panel"
        interactive
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="flex items-center gap-3">
          <Icon name="Building2" tone="accent" size={24} />
          <div className="flex-1 text-left">
            <div className="text-xs text-light-700">
              {t("organization.title")}
            </div>
            <div className="font-bold text-primary-300">
              {currentOrganization?.name ||
                t("organization.selectOrganization")}
            </div>
          </div>
          <span
            className={`transition-transform ${
              showDropdown ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            <Icon name="ChevronDown" tone="neutral" size={18} />
          </span>
        </div>
      </Card>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 z-50 w-80">
          <Card surface="glass" tone="accent" padding="xs" elevation="panel">
            <div className="max-h-96 overflow-y-auto">
              {/* Organization List */}
              <div className="space-y-2">
                {organizations.map((org) => {
                  const isActive = currentOrganization?.id === org.id;

                  return (
                    <Card
                      key={org.id}
                      surface={isActive ? "accent" : "base"}
                      tone={isActive ? "accent" : "primary"}
                      padding="sm"
                      elevation={isActive ? "glow" : "none"}
                      interactive
                      onClick={() => {
                        setCurrentOrganization(org);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-sm">{org.name}</div>
                        {org.description && (
                          <p className="text-xs text-light-400">
                            {org.description}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Create New Organization Button */}
              <div className="mt-3 pt-3 border-t border-dark-700">
                <Button
                  onClick={() => {
                    setShowCreateForm(true);
                    setShowDropdown(false);
                  }}
                  variant="ghost"
                  tone="accent"
                  effect="flat"
                  fullWidth
                  alignment="start"
                  size="sm"
                  icon={{ name: "Plus", tone: "accent", size: 18 }}
                >
                  {t("organization.createNew")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <Card surface="panel" tone="primary" padding="md" elevation="panel">
              <h2 className="text-2xl font-bold text-gradient-neon mb-4">
                {t("organization.createNew")}
              </h2>
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-light-700 mb-2">
                    {t("organization.organizationNameRequired")}
                  </label>
                  <input
                    type="text"
                    ref={nameInputRef}
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-800 border-2 border-primary-500 rounded-lg text-light-100 focus:outline-none focus:border-primary-400"
                    placeholder={t("organization.enterOrganizationName")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-light-700 mb-2">
                    {t("organization.descriptionOptional")}
                  </label>
                  <textarea
                    value={newOrgDescription}
                    onChange={(e) => setNewOrgDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-800 border-2 border-primary-500 rounded-lg text-light-100 focus:outline-none focus:border-primary-400"
                    placeholder={t("organization.enterOrganizationDescription")}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Button
                      type="submit"
                      variant="accent"
                      fullWidth
                      disabled={isCreating || !newOrgName.trim()}
                    >
                      {isCreating
                        ? t("organization.creating")
                        : t("organization.createOrganization")}
                    </Button>
                  </div>
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewOrgName("");
                      setNewOrgDescription("");
                    }}
                    disabled={isCreating}
                  >
                    {t("common.cancel")}
                  </SecondaryButton>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
