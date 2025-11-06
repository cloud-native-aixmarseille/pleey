import React from 'react';
import { Card } from '../Card';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'purple';
}

/**
 * Reusable Stats Card Component
 * Displays a statistic with label, value, and icon
 */
export function StatsCard({ label, value, icon, variant = 'primary' }: StatsCardProps) {
  const variantStyles = {
    primary: {
      bg: 'bg-gradient-to-br from-primary-50 to-primary-100',
      border: 'border-primary-200',
      labelColor: 'text-primary-600',
      valueColor: 'text-primary-700',
    },
    secondary: {
      bg: 'bg-gradient-to-br from-secondary-50 to-secondary-100',
      border: 'border-secondary-200',
      labelColor: 'text-secondary-600',
      valueColor: 'text-secondary-700',
    },
    accent: {
      bg: 'bg-gradient-to-br from-accent-50 to-accent-100',
      border: 'border-accent-200',
      labelColor: 'text-accent-700',
      valueColor: 'text-accent-800',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      labelColor: 'text-purple-600',
      valueColor: 'text-purple-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className={`p-6 ${styles.bg} border-2 ${styles.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${styles.labelColor} font-semibold text-sm mb-1`}>
            {label}
          </p>
          <p className={`text-4xl font-black ${styles.valueColor}`}>
            {value}
          </p>
        </div>
        <div className="text-5xl opacity-20">{icon}</div>
      </div>
    </Card>
  );
}
