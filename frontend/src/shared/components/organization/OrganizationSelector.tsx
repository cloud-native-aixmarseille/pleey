import React, { useState } from "react";
import { useOrganization } from "../../context/OrganizationContext";
import { useTranslation } from "react-i18next";
import Button from "../Button";
import Card from "../Card";

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

  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
      // Show user-friendly error message
      alert(t("organization.errors.createFailed"));
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
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-dark-800 border-2 border-primary-500 rounded-lg hover:bg-dark-700 transition-colors"
      >
        <span className="text-xl">🏢</span>
        <div className="text-left">
          <div className="text-xs text-light-700">
            {t("organization.title")}
          </div>
          <div className="font-bold text-primary-400">
            {currentOrganization?.name || t("organization.selectOrganization")}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-light-700 transition-transform ${
            showDropdown ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 z-50 w-80">
          <Card className="p-2 max-h-96 overflow-y-auto">
            {/* Organization List */}
            <div className="space-y-1">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setCurrentOrganization(org);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentOrganization?.id === org.id
                      ? "bg-primary-500 text-white"
                      : "hover:bg-dark-700 text-light-200"
                  }`}
                >
                  <div className="font-semibold">{org.name}</div>
                  {org.description && (
                    <div className="text-xs opacity-75 mt-1">
                      {org.description}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Create New Organization Button */}
            <div className="mt-2 pt-2 border-t border-dark-700">
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setShowDropdown(false);
                }}
                className="w-full px-3 py-2 text-left text-primary-400 hover:bg-dark-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>{t("organization.createNew")}</span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
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
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border-2 border-primary-500 rounded-lg text-light-100 focus:outline-none focus:border-primary-400"
                  placeholder={t("organization.enterOrganizationName")}
                  required
                  autoFocus
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
                <Button
                  type="submit"
                  variant="accent"
                  disabled={isCreating || !newOrgName.trim()}
                  className="flex-1"
                >
                  {isCreating
                    ? t("organization.creating")
                    : t("organization.createOrganization")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewOrgName("");
                    setNewOrgDescription("");
                  }}
                  disabled={isCreating}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
