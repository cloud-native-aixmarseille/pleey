---
title: Shared UI Components Props TODO
---

This checklist inventories props for each component in `application/frontend/src/shared/ui/components` and summarizes how they’re used in the current frontend codebase.

- [ ] Button
  - children: used.
  - variant?: varies (`primary`, `secondary`, `accent`, `success`, `danger`, `outline`, `ghost`).
  - tone?: varies (`primary`, `secondary`, `accent`, `success`, `danger`, `neutral`).
  - size?: varies (`sm`, `md`, `lg`, `xl`).
  - fullWidth?: varies.
  - effect?: varies (`glow`, `retro`, `flat`).
  - icon?: varies.
  - tooltip?: used.
  - alignment?: varies (`start`, `center`, `end`).

- [ ] PrimaryButton
  - Props: `Omit<ButtonProps, "variant" | "tone">`.
  - Usage: varies (e.g. `size`, `fullWidth`, `effect`, `disabled`, `type`, `onClick`).

- [ ] SecondaryButton
  - Props: `Omit<ButtonProps, "variant" | "tone">`.
  - Usage: varies (e.g. `size`, `disabled`, `icon`, `onClick`).

- [ ] BackToButton
  - label: used.
  - variant?: varies (`secondary`, `ghost`, `link`).
  - tone?: varies (`default`, `light`, `accent`, `primary`).
  - alignment?: rarely overridden (defaults to `start`).

- [ ] Card
  - children: used.
  - surface?: varies (`base`, `glass`, `panel`, `gradient`, `accent`, `inverted`, `outline`).
  - tone?: varies (`primary`, `secondary`, `accent`, `neutral`, `success`, `danger`, `light`).
  - padding?: varies (`none`, `xs`, `sm`, `md`, `lg`, `xl`).
  - elevation?: varies (`none`, `glow`, `retro`, `panel`).
  - border?: varies (`none`, `thin`, `regular`, `thick`).
  - alignment?: varies (`start`, `center`).
  - overflow?: varies (`visible`, `hidden`).
  - motion?: varies (`none`, `fade`, `scale`, `slide-up`, `slide-down`).
  - interactive?: used.
  - fullWidth?: used.
  - as?: used.

- [ ] Input
  - label?: used.
  - hint?: used.
  - error?: used.
  - tone?: used (default `default`, some screens may use `dark`).
  - fullWidth?: mostly default `true`.
  - icon?: used.
  - trailingNode?: used (notably by `PasswordInput`).

- [ ] PasswordInput
  - Also accepts `Omit<InputProps, "type" | "trailingNode" | "icon">`.

- [ ] Modal
  - isOpen: used.
  - title: used.
  - description?: used.
  - onClose: used.
  - children: used.
  - footer?: used.

- [ ] Container
  - children: used.
  - size?: varies (`sm`, `md`, `lg`, `xl`, `full`).

- [ ] Avatar
  - name: used.
  - src?: used.
  - size?: varies (`sm`, `md`, `lg`).

- [ ] InfoItem
  - icon: used.
  - label: used.
  - value: used.
  - tone?: varies (`primary`, `secondary`, `neutral`).

- [ ] StatsCard
  - label: used.
  - value: used.
  - icon?: used.
  - variant?: varies (`primary`, `secondary`, `accent`, `purple`).

- [ ] ArcadePage (reexport stub)
  - Reexports `ArcadePage` + `ArcadePageProps` from `application/frontend/src/shared/ui/layout/ArcadePage.tsx`.
  - Usage: varies across routes (layout/padding/align/overlays).

- [ ] ArcadeSectionHeader (reexport stub)
  - Reexports `ArcadeSectionHeader` + `ArcadeSectionHeaderProps` from `application/frontend/src/shared/ui/layout/ArcadeSectionHeader.tsx`.
  - Usage: varies.

- [ ] ArcadeCardGrid
  - children: used.
  - layout?: varies (`double`, `triple`, `quad`).
  - bottomSpacing?: varies (`none`, `sm`, `md`, `lg`).
  - role?: used.
  - ariaLabel?: used.

- [ ] ArcadeBadge
  - children: used.
  - tone?: varies.
  - size?: varies.
  - indicator?: varies.
  - pulse?: varies.

- [ ] ArcadeToggleGroup
  - value: used.
  - onChange: used.
  - options: used.
  - size?: likely defaulted to `md` (check if any other sizes used).
  - multiSelect?: varies.
  - topSpacing?: used (`md`).
  - ariaLabel?: unknown (no current usage).

- [ ] ArcadeProgressBar
  - value: used.
  - min?: used.
  - max?: used.
  - tone?: varies.
  - size?: varies.
  - pulse?: varies.
  - animationDelay?: used.
  - trackVariant?: varies (`timer`, `distribution`, `host`, `results`).
  - fillPadding?: used (`results`).
  - ariaLabel?: used.
  - children?: used.

- [ ] ArcadeLeaderboardRow
  - position: used.
  - username: used.
  - points: used.
  - tone?: varies.
  - animationOrder?: used.

- [ ] ArcadeTimer
  - value: used.
  - suffix?: used.
  - label?: used.
  - tone?: varies.
  - variant?: varies.
  - size?: varies.
  - pulse?: varies.
  - role?: used.
  - ariaLabel?: used.
  - ariaLive?: used.
  - ariaAtomic?: used.
