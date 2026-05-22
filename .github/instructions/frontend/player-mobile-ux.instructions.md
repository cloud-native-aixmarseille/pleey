---
name: "Pleey Player Mobile UX Rules"
description: "Use when working on Pleey player-facing presentation surfaces (party player screens, game-type player surfaces) under application/frontend."
applyTo: "application/frontend/src/presentation/{**/player/**,**/*player*}.{ts,tsx}"
---

# Pleey player mobile UX rules

Player surfaces are consumed on phones first. Optimize every player-facing screen, panel, and surface for mobile because the player journey must stay legible and scroll-light on small viewports. Apply these rules in addition to `.github/instructions/frontend/react.instructions.md` and `.github/instructions/frontend/accessibility.instructions.md`.

- Detect mobile with `usePresentationMediaQuery('(max-width: 48em)')` and branch layout density on it because that breakpoint is the canonical phone breakpoint used across the app (mirrors `PartyFinalSummaryPanel`).
- Shrink container density on mobile: drop `HeroPanel` padding from `xl` to `lg`, `ElevatedPanel`/`InsetPanel` padding from `lg` to `md`, and `ContentStack` gap from `lg` to `md` (and from `md` to `sm` inside nested stacks) because default desktop spacing wastes vertical space on phones.
- Demote hero typography on mobile: render `Heading` as `level={2}` without the `hero` flag, drop decorative `AccentIconBadge`/`Eyebrow` rows, and drop long supporting subtitles because the title and primary action are the only required hero content on a phone.
- Forward `isMobile` to shared collections that support it (e.g. `PartyStandingsList`) because their mobile row variants are substantially shorter than their desktop counterparts.
- Collapse related metadata into a single `SplitWrapRow` (e.g. "Stage X of Y" + countdown timer, progress + total score) instead of stacking each in its own `SupportingText` line because each extra line forces another scroll on mobile.
- Do not render redundant copy: never repeat the same i18n key in a surrounding `SupportingText` and a `FieldShell` description; never repeat status-bar messaging in an adjacent info panel; never restate a CTA label in a preview tile above the button.
- Do not add decorative info panels (`InsetPanel` with `AppIcon name="info"` + soft text) just to explain what the screen already does because that pattern duplicates the status bar and burns vertical space.
- Centre primary actions on mobile (`ActionRow justify="center"`) and end-align on desktop because end-aligned buttons read as secondary on narrow viewports.
- Keep i18n parity when removing redundant copy: delete the unused key from both `en.ts` and `fr.ts` so the translation-resource composer spec stays green.
- Validate player UX changes against the party lobby screen spec and the translation-resource composer spec because both guard the player runtime surfaces and locale keys.

Preferred pattern:

```tsx
const isMobile = usePresentationMediaQuery("(max-width: 48em)");

return (
  <ContentStack gap={isMobile ? "md" : "lg"}>
    <PlayerPartyStatusBar
      party={party}
      variant="paused-only"
      onLeaveParty={onLeaveParty}
    />
    <InsetPanel padding={isMobile ? "md" : "lg"}>
      <ContentStack gap={isMobile ? "sm" : "md"}>
        <SplitWrapRow align="center" gap="sm">
          <SupportingText tone="soft">{progressText}</SupportingText>
          <SupportingText tone="soft">{totalScoreText}</SupportingText>
        </SplitWrapRow>
        <Heading level={3}>{currentStage.text}</Heading>
        {children}
      </ContentStack>
    </InsetPanel>
    <PartyStandingsList isMobile={isMobile} {...standingsProps} />
  </ContentStack>
);
```

Avoid stacking decorative hero rows, duplicate descriptions, or desktop-density panels on player surfaces.
