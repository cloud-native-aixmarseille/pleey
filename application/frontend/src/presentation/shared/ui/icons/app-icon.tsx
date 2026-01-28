import {
  IconAlertCircle,
  IconArrowRight,
  IconBuilding,
  IconChartBar,
  IconChevronDown,
  IconCircleCheck,
  IconClockPause,
  IconDeviceGamepad2,
  IconHelpCircle,
  IconInbox,
  IconInfoCircle,
  IconLanguage,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLogin2,
  IconLogout2,
  IconMoonStars,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconPower,
  type IconProps,
  IconSearch,
  IconSettings,
  IconSortAscending,
  IconSortDescending,
  IconSparkles,
  IconSun,
  IconTrendingUp,
  IconTrophy,
  IconUser,
  IconUserCircle,
  IconUserPlus,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

export type AppIconName =
  | 'account'
  | 'arrow-right'
  | 'catalog'
  | 'chevron-down'
  | 'dashboard'
  | 'dark-mode'
  | 'empty'
  | 'error'
  | 'feature'
  | 'game'
  | 'info'
  | 'language'
  | 'light-mode'
  | 'not-found'
  | 'organization'
  | 'pause'
  | 'pending'
  | 'play'
  | 'power'
  | 'prediction'
  | 'profile'
  | 'quiz'
  | 'register'
  | 'settings'
  | 'sign-in'
  | 'sign-out'
  | 'skip-back'
  | 'skip-forward'
  | 'sort-asc'
  | 'sort-desc'
  | 'stats'
  | 'success'
  | 'trophy';

const iconRegistry: Record<AppIconName, ComponentType<IconProps>> = {
  account: IconUserCircle,
  'arrow-right': IconArrowRight,
  catalog: IconLayoutGrid,
  'chevron-down': IconChevronDown,
  dashboard: IconLayoutDashboard,
  'dark-mode': IconMoonStars,
  empty: IconInbox,
  error: IconAlertCircle,
  feature: IconSparkles,
  game: IconDeviceGamepad2,
  info: IconInfoCircle,
  language: IconLanguage,
  'light-mode': IconSun,
  'not-found': IconSearch,
  organization: IconBuilding,
  pause: IconPlayerPause,
  pending: IconClockPause,
  play: IconPlayerPlay,
  power: IconPower,
  prediction: IconTrendingUp,
  profile: IconUser,
  quiz: IconHelpCircle,
  register: IconUserPlus,
  settings: IconSettings,
  'sign-in': IconLogin2,
  'sign-out': IconLogout2,
  'skip-back': IconPlayerTrackPrev,
  'skip-forward': IconPlayerTrackNext,
  'sort-asc': IconSortAscending,
  'sort-desc': IconSortDescending,
  stats: IconChartBar,
  success: IconCircleCheck,
  trophy: IconTrophy,
};

interface AppIconProps extends Omit<IconProps, 'size'> {
  readonly name: AppIconName;
  readonly decorative?: boolean;
  readonly size?: number;
}

export function AppIcon({
  name,
  decorative = true,
  size = 18,
  stroke = 1.75,
  ...props
}: AppIconProps) {
  const IconComponent = iconRegistry[name];

  return (
    <IconComponent
      aria-hidden={decorative}
      focusable={false}
      size={size}
      stroke={stroke}
      {...props}
    />
  );
}

export const homeFeatureIconNames = [
  'feature',
  'account',
  'game',
] as const satisfies readonly AppIconName[];
export const homeStepIconNames = [
  'register',
  'settings',
  'trophy',
] as const satisfies readonly AppIconName[];
