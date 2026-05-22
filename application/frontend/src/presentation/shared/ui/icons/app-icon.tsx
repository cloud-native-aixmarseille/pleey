import {
  IconAlertCircle,
  IconArchive,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconBuilding,
  IconChartBar,
  IconChevronDown,
  IconCircleCheck,
  IconClockPause,
  IconCommand,
  IconCopy,
  IconDeviceFloppy,
  IconDeviceGamepad2,
  IconDots,
  IconEye,
  IconGripVertical,
  IconHelpCircle,
  IconInbox,
  IconInfoCircle,
  IconLanguage,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLogin2,
  IconLogout2,
  IconMenu2,
  IconMoonStars,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconPower,
  type IconProps,
  IconRocket,
  IconSearch,
  IconSettings,
  IconSortAscending,
  IconSortDescending,
  IconSparkles,
  IconSun,
  IconTrash,
  IconTrendingUp,
  IconTrophy,
  IconUser,
  IconUserCircle,
  IconUserPlus,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

export type AppIconName =
  | 'account'
  | 'archive'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'catalog'
  | 'chevron-down'
  | 'command'
  | 'copy'
  | 'dashboard'
  | 'dark-mode'
  | 'dots'
  | 'empty'
  | 'error'
  | 'eye'
  | 'feature'
  | 'game'
  | 'grip-vertical'
  | 'info'
  | 'language'
  | 'light-mode'
  | 'menu'
  | 'not-found'
  | 'organization'
  | 'pause'
  | 'pending'
  | 'play'
  | 'power'
  | 'prediction'
  | 'profile'
  | 'plus'
  | 'quiz'
  | 'register'
  | 'rocket'
  | 'save'
  | 'search'
  | 'settings'
  | 'sign-in'
  | 'sign-out'
  | 'skip-back'
  | 'skip-forward'
  | 'sort-asc'
  | 'sort-desc'
  | 'stats'
  | 'success'
  | 'trash'
  | 'trophy';

const iconRegistry: Record<AppIconName, ComponentType<IconProps>> = {
  account: IconUserCircle,
  archive: IconArchive,
  'arrow-down': IconArrowDown,
  'arrow-left': IconArrowLeft,
  'arrow-right': IconArrowRight,
  'arrow-up': IconArrowUp,
  catalog: IconLayoutGrid,
  'chevron-down': IconChevronDown,
  command: IconCommand,
  copy: IconCopy,
  dashboard: IconLayoutDashboard,
  'dark-mode': IconMoonStars,
  dots: IconDots,
  empty: IconInbox,
  error: IconAlertCircle,
  eye: IconEye,
  feature: IconSparkles,
  game: IconDeviceGamepad2,
  'grip-vertical': IconGripVertical,
  info: IconInfoCircle,
  language: IconLanguage,
  'light-mode': IconSun,
  menu: IconMenu2,
  'not-found': IconSearch,
  organization: IconBuilding,
  pause: IconPlayerPause,
  pending: IconClockPause,
  play: IconPlayerPlay,
  power: IconPower,
  prediction: IconTrendingUp,
  profile: IconUser,
  plus: IconUserPlus,
  quiz: IconHelpCircle,
  register: IconUserPlus,
  rocket: IconRocket,
  save: IconDeviceFloppy,
  search: IconSearch,
  settings: IconSettings,
  'sign-in': IconLogin2,
  'sign-out': IconLogout2,
  'skip-back': IconPlayerTrackPrev,
  'skip-forward': IconPlayerTrackNext,
  'sort-asc': IconSortAscending,
  'sort-desc': IconSortDescending,
  stats: IconChartBar,
  success: IconCircleCheck,
  trash: IconTrash,
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
