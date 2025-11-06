import React from 'react';
import { useOrganization } from '../../../shared/context/OrganizationContext';
import { Card, Container } from '../../../shared/components';
import { useTranslation } from 'react-i18next';

/**
 * Organization Dashboard Component
 * Displays organization statistics and information
 */
export function OrganizationDashboard() {
  const { t } = useTranslation();
  const { currentOrganization, dashboard } = useOrganization();

  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-game-gradient p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-2xl font-bold text-dark-800 mb-2">
            {t('organization.noOrganizationSelected')}
          </h3>
          <p className="text-light-700">
            {t('organization.selectToView')}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-6 lg:p-8">
      <Container size="xl">
        {/* Header */}
        <Card className="p-6 sm:p-8 mb-6 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">🏢</span>
                <h1 className="text-3xl sm:text-4xl font-black text-gradient-neon">
                  {currentOrganization.name}
                </h1>
              </div>
              {currentOrganization.description && (
                <p className="text-light-700 mt-2">
                  {currentOrganization.description}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
            <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 font-semibold text-sm mb-1">
                    {t('organization.totalQuizzes')}
                  </p>
                  <p className="text-4xl font-black text-primary-700">
                    {dashboard.stats.totalQuizzes}
                  </p>
                </div>
                <div className="text-5xl opacity-20">📚</div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 border-2 border-secondary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-600 font-semibold text-sm mb-1">
                    {t('organization.gameSessions')}
                  </p>
                  <p className="text-4xl font-black text-secondary-700">
                    {dashboard.stats.totalGameSessions}
                  </p>
                </div>
                <div className="text-5xl opacity-20">🎮</div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent-50 to-accent-100 border-2 border-accent-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent-700 font-semibold text-sm mb-1">
                    {t('organization.activeSessions')}
                  </p>
                  <p className="text-4xl font-black text-accent-800">
                    {dashboard.stats.activeGameSessions}
                  </p>
                </div>
                <div className="text-5xl opacity-20">🎯</div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 font-semibold text-sm mb-1">
                    {t('organization.members')}
                  </p>
                  <p className="text-4xl font-black text-purple-700">
                    {dashboard.stats.totalMembers}
                  </p>
                </div>
                <div className="text-5xl opacity-20">👥</div>
              </div>
            </Card>
          </div>
        )}

        {/* Organization Info */}
        <Card className="p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-dark-800 mb-4">
            {t('organization.organizationDetails')}
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-sm text-light-700">{t('organization.organizationNameLabel')}</p>
                <p className="font-semibold text-dark-800">
                  {currentOrganization.name}
                </p>
              </div>
            </div>
            {currentOrganization.description && (
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="text-sm text-light-700">{t('organization.descriptionLabel')}</p>
                  <p className="font-semibold text-dark-800">
                    {currentOrganization.description}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-sm text-light-700">{t('organization.created')}</p>
                <p className="font-semibold text-dark-800">
                  {new Date(currentOrganization.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
