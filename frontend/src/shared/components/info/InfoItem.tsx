import React from 'react';

interface InfoItemProps {
  icon: string;
  label: string;
  value: string;
}

/**
 * Reusable Info Item Component
 * Displays a labeled piece of information with an icon
 */
export function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-light-700">{label}</p>
        <p className="font-semibold text-dark-800">{value}</p>
      </div>
    </div>
  );
}
