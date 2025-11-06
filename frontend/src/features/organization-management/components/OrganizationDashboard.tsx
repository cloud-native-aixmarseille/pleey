import React from 'react';
import { useOrganization } from '../../../shared/context/OrganizationContext';
import { Card, Container } from '../../../shared/components';
import { StatsCard } from '../../../shared/components/stats/StatsCard';
import { InfoItem } from '../../../shared/components/info/InfoItem';
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
            <StatsCard
              label={t('organization.totalQuizzes')}
              value={dashboard.stats.totalQuizzes}
              icon="📚"
              variant="primary"
            />
            <StatsCard
              label={t('organization.gameSessions')}
              value={dashboard.stats.totalGameSessions}
              icon="🎮"
              variant="secondary"
            />
            <StatsCard
              label={t('organization.activeSessions')}
              value={dashboard.stats.activeGameSessions}
              icon="🎯"
              variant="accent"
            />
            <StatsCard
              label={t('organization.members')}
              value={dashboard.stats.totalMembers}
              icon="👥"
              variant="purple"
            />
          </div>
        )}

        {/* Organization Info */}
        <Card className="p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-dark-800 mb-4">
            {t('organization.organizationDetails')}
          </h2>
          <div className="space-y-3">
            <InfoItem
              icon="📋"
              label={t('organization.organizationNameLabel')}
              value={currentOrganization.name}
            />
            {currentOrganization.description && (
              <InfoItem
                icon="📝"
                label={t('organization.descriptionLabel')}
                value={currentOrganization.description}
              />
            )}
            <InfoItem
              icon="📅"
              label={t('organization.created')}
              value={new Date(currentOrganization.createdAt).toLocaleDateString()}
            />
          </div>
        </Card>
      </Container>
    </div>
  );
}
