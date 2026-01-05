import React, { useEffect, useRef, useState } from "react";
import { useOrganization } from "../../context/OrganizationContext";
import { useTranslation } from "react-i18next";
import Button from "../button/Button";
import SecondaryButton from "../button/SecondaryButton";
import Card from "../Card";
import Modal from "../Modal";
import Input from "../Input";
import { Icon } from "../../ui/icons";
import { useNotifications } from "../../../application/app/hooks/useNotifications";

const CREATE_FORM_CONTENT_CLASSES = "space-y-6";
const CREATE_LABEL_CLASSES =
  "block text-xs font-semibold uppercase tracking-[0.3em] text-light-500";
const CREATE_INPUT_WRAPPER_CLASSES = "mt-2";
const CREATE_TEXTAREA_CLASSES =
  "mt-2 w-full rounded-2xl border border-primary-500/30 bg-dark-500/60 p-4 text-sm text-light-100 shadow-inner focus:border-primary-400 focus:outline-none";

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

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setNewOrgName("");
    setNewOrgDescription("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-dark-500 dark:text-light-700">
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
            <div className="text-xs text-dark-500 dark:text-light-700">
              {t("organization.title")}
            </div>
            <div className="font-bold text-primary-800 dark:text-primary-300">
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
            <div className="max-h-96 overflow-y-auto overflow-x-hidden">
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
                          <p className="text-xs text-dark-400 dark:text-light-400">
                            {org.description}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Create New Organization Button */}
              <div className="mt-3 pt-3 border-t border-light-300 dark:border-dark-700">
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
                  className="min-w-0"
                  icon={{ name: "Plus", tone: "accent", size: 18 }}
                >
                  <span className="min-w-0 whitespace-normal break-words text-left">
                    {t("organization.createNew")}
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={closeCreateForm}
        title={t("organization.createNew")}
        footer={
          <>
            <SecondaryButton
              type="button"
              onClick={closeCreateForm}
              disabled={isCreating}
            >
              {t("common.cancel")}
            </SecondaryButton>
            <Button
              type="submit"
              form="create-organization-form"
              variant="accent"
              disabled={isCreating || !newOrgName.trim()}
            >
              {isCreating
                ? t("organization.creating")
                : t("organization.createOrganization")}
            </Button>
          </>
        }
      >
        <form id="create-organization-form" onSubmit={handleCreateOrganization}>
          <div className={CREATE_FORM_CONTENT_CLASSES}>
            <div>
              <label className={CREATE_LABEL_CLASSES}>
                {t("organization.organizationNameRequired")}
              </label>
              <div className={CREATE_INPUT_WRAPPER_CLASSES}>
                <Input
                  ref={nameInputRef}
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder={t("organization.enterOrganizationName")}
                  required
                />
              </div>
            </div>
            <div>
              <label className={CREATE_LABEL_CLASSES}>
                {t("organization.descriptionOptional")}
              </label>
              <textarea
                value={newOrgDescription}
                onChange={(e) => setNewOrgDescription(e.target.value)}
                rows={3}
                className={CREATE_TEXTAREA_CLASSES}
                placeholder={t("organization.enterOrganizationDescription")}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
