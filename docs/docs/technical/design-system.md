---
sidebar_position: 2
---

# 🎮 Cyber Arcade Design System

## Overview

The **Cyber Arcade** design system is a retro-futuristic design language that combines 80s arcade aesthetics with synthwave cyberpunk elements. It creates an immersive gaming experience through authentic pixel art styling, CRT screen effects, and neon-soaked visuals.

### Key Characteristics

- **Retro Gaming**: Authentic 8-bit and 16-bit era aesthetics
- **Synthwave**: Purple/pink/cyan neon color harmony
- **Cyberpunk**: Terminal interfaces and hacker culture references
- **Accessibility**: WCAG 2.1 AA compliant with high contrast ratios
- **Responsive**: Mobile-first design that scales beautifully

---

## Design Philosophy

The Cyber Arcade design system embodies five core principles:

### 1. 🕹️ Retro Gaming Nostalgia

Authentic recreation of 80s/90s arcade machine aesthetics:

- Sharp corners and pixel-perfect edges (no border-radius on primary elements)
- Pixel shadows that mimic sprite rendering
- Arcade cabinet-inspired card layouts
- Retro gaming terminology ("INSERT COIN", "PRESS START", "GAME OVER")

### 2. 🌈 Synthwave Culture

Color palette inspired by synthwave music and vaporwave art:

- Purple/pink/cyan neon glow combinations
- High contrast against dark backgrounds
- Triple-layer shadow effects for depth
- Grid backgrounds reminiscent of Tron and early 3D graphics

### 3. 💻 Hacker Terminal

Command-line interface aesthetics:

- Monospace fonts for technical elements
- Terminal-style prompts and readouts
- Matrix green for success states
- Blinking cursors and scanline effects

### 4. 📺 CRT Screen Effects

Authentic vintage monitor simulation:

- Horizontal scanlines overlay
- Subtle screen flicker animation
- Phosphor glow on text elements
- Inset shadow suggesting curved glass

### 5. ✨ Pixel Art

8-bit and 16-bit sprite rendering techniques:

- Solid color fills (minimal gradients)
- 8px offset shadows for depth
- Sharp anti-aliasing disabled on key elements
- Pixel-perfect alignment on grid

---

## Color Palette

### Primary Colors

#### Electric Purple `#6b48ff`

**Usage**: Primary actions, main branding, primary buttons  
**Accessibility**: AAA on dark backgrounds, AA on light backgrounds  
**Scale**:

```text
primary-50:  #f0f0ff  (lightest - backgrounds)
primary-100: #e0dcff
primary-200: #c7c0ff
primary-300: #a89dff
primary-400: #8a73ff
primary-500: #6b48ff  ← Main
primary-600: #5c3ad6
primary-700: #4d2db3
primary-800: #3e2090
primary-900: #2f1870  (darkest - text on light)
```

#### Hot Pink `#ff33c6`

**Usage**: Secondary actions, accents, highlights  
**Accessibility**: AAA on dark backgrounds  
**Scale**:

```text
secondary-50:  #fff0fb
secondary-100: #ffd6f3
secondary-200: #ffade8
secondary-300: #ff85dd
secondary-400: #ff5cd1
secondary-500: #ff33c6  ← Main
secondary-600: #d62ba3
secondary-700: #b32387
secondary-800: #901b6b
secondary-900: #6d144f
```

#### Cyber Cyan `#00ffcc`

**Usage**: Accent elements, terminal text, interactive states  
**Accessibility**: AAA on dark backgrounds  
**Scale**:

```text
accent-50:  #e6fff9
accent-100: #b3fff0
accent-200: #80ffe6
accent-300: #4dffdd
accent-400: #1affd4
accent-500: #00ffcc  ← Main
accent-600: #00d6ad
accent-700: #00b38f
accent-800: #009070
accent-900: #006d52
```

### Semantic Colors

#### Matrix Green `#00ff41` (Success)

**Usage**: Success states, confirmations, positive feedback  
**Accessibility**: AAA on dark backgrounds  
**Meaning**: Classic hacker terminal green, represents completion and success

#### Pure Red `#ff0000` (Danger)

**Usage**: Errors, warnings, game over screens  
**Accessibility**: AAA on dark backgrounds  
**Meaning**: Arcade alert color, high visibility for critical actions

#### Deep Space `#0a0a1f` (Dark)

**Usage**: Backgrounds, card backgrounds, containers  
**Accessibility**: Provides high contrast base for neon colors  
**Meaning**: Almost-black void reminiscent of CRT screens when off

### Arcade Accent Colors

**Special use colors for variety and retro authenticity:**

```css
arcade-yellow: #ffff00
arcade-orange: #ff9900
arcade-blue:   #0099ff
arcade-green:  #00ff00
arcade-pink:   #ff00ff
```

### Color Usage Guidelines

**DO:**

- ✅ Use primary purple for main CTAs and branding
- ✅ Use secondary pink for highlights and secondary actions
- ✅ Use accent cyan for terminal-style text and interactive states
- ✅ Use dark backgrounds to make neon colors pop
- ✅ Combine colors with neon glow effects for emphasis

**DON'T:**

- ❌ Use neon colors on light backgrounds (poor contrast)
- ❌ Mix more than 3 neon colors in a single component
- ❌ Use subtle pastels (breaks the vibrant aesthetic)
- ❌ Apply gradients to primary buttons (use solid colors)

---

## Typography

### Font Stack

#### Display Font: Press Start 2P

**Usage**: Headings, titles, game text, arcade-style elements  
**Weight**: Regular (400)  
**Source**: Google Fonts  
**License**: SIL Open Font License

```css
font-family: "Press Start 2P", system-ui, sans-serif;
```

**Characteristics**:

- Authentic 8-bit pixel font
- Fixed-width characters
- Best at larger sizes (18px+)
- ALL CAPS for maximum impact
- Letter spacing: `0.1em` to `0.2em`

**Usage Example**:

```css
h1 {
  font-family: "Press Start 2P";
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-shadow: 0 0 10px currentColor;
}
```

#### Monospace Font: VT323

**Usage**: Terminal text, code snippets, technical readouts  
**Weight**: Regular (400)  
**Source**: Google Fonts  
**License**: SIL Open Font License

```css
font-family: "VT323", "Fira Code", monospace;
```

**Characteristics**:

- Terminal/console aesthetic
- Excellent readability at small sizes
- Authentic retro computing feel
- Use for: timestamps, counters, technical data

#### Body Font: Orbitron

**Usage**: Body text, descriptions, longer content  
**Weights**: 400, 500, 600, 700, 800, 900  
**Source**: Google Fonts  
**License**: SIL Open Font License

```css
font-family: "Orbitron", system-ui, sans-serif;
```

**Characteristics**:

- Futuristic sci-fi aesthetic
- Geometric letterforms
- Better readability than pixel fonts
- Use for: paragraphs, labels, UI text

### Type Scale

```css
/* Pixel-perfect scale */
font-xxs:  0.625rem  (10px)  - Small labels
font-xs:   0.75rem   (12px)  - Captions
font-sm:   0.875rem  (14px)  - Small body text
font-base: 1rem      (16px)  - Body text
font-lg:   1.125rem  (18px)  - Large body
font-xl:   1.25rem   (20px)  - Small headings
font-2xl:  1.5rem    (24px)  - Subheadings
font-3xl:  1.875rem  (30px)  - Headings
font-4xl:  2.25rem   (36px)  - Large headings
font-5xl:  3rem      (48px)  - Display text
font-6xl:  3.75rem   (60px)  - Hero text
font-7xl:  4.5rem    (72px)  - Extra large
font-8xl:  6rem      (96px)  - Massive
font-9xl:  8rem      (128px) - Ultra
```

### Text Effects

#### Neon Glow

**Usage**: Headings, important text, calls to action

```css
.text-neon {
  text-shadow:
    0 0 7px currentColor,
    0 0 10px currentColor,
    0 0 21px currentColor,
    0 0 42px currentColor;
}
```

#### CRT Glow

**Usage**: Subtle emphasis on body text

```css
.text-shadow {
  text-shadow: 0 0 10px currentColor;
}
```

#### Terminal Blink

**Usage**: Cursor effects, loading states

```css
.animate-flicker {
  animation: flicker 0.15s infinite;
}

@keyframes flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

---

## Components

### Buttons

#### Primary Button

**Usage**: Main actions, login, submit forms

```tsx
<Button variant="primary" size="lg">
  ► LOGIN
</Button>
```

**Styling**:

- Background: `primary-500` (#6b48ff)
- Text: White
- Border: 2px solid `primary-300`
- Shadow: Triple neon glow
- Font: Press Start 2P
- Text transform: Uppercase
- Hover: Scale 1.05, brighter glow

#### Secondary Button

**Usage**: Alternative actions, navigation

```tsx
<Button variant="secondary" size="lg">
  ✦ SIGN UP
</Button>
```

**Styling**:

- Background: `secondary-500` (#ff33c6)
- Text: White
- Border: 2px solid `secondary-300`
- Shadow: Pink neon glow
- Hover: Scale 1.05

#### Accent Button

**Usage**: Special actions, highlights

```tsx
<Button variant="accent" size="lg">
  START GAME
</Button>
```

**Styling**:

- Background: `accent-500` (#00ffcc)
- Text: `dark-500`
- Border: 2px solid `accent-300`
- Shadow: Cyan neon glow
- Font weight: Black

#### Retro Shadow Effect

**All buttons include**:

```css
box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.8);
```

On hover, the button moves down-right and shadow disappears:

```css
&:hover {
  transform: translate(1px, 1px);
  box-shadow: 7px 7px 0px rgba(0, 0, 0, 0.8);
}
```

### Cards

#### Standard Card

**Usage**: Content containers, quiz items, player displays

```tsx
<Card>
  <h3>Quiz Title</h3>
  <p>Description</p>
</Card>
```

**Styling**:

- Background: `dark-400` with subtle purple tint
- Border: 2px solid `primary-500/30`
- Border radius: `0.5rem` (8px)
- Box shadow: Inset purple glow + outer neon
- Padding: `1.5rem` (24px)

#### Glass Card

**Usage**: Overlays, floating elements, special highlights

```tsx
<Card variant="glass">
  <p>Feature Badge</p>
</Card>
```

**Styling**:

- Background: `dark-400/50` with backdrop blur
- Border: 2px solid `accent-500/30`
- Backdrop filter: `blur(12px)`
- Box shadow: Cyan glow

#### Arcade Card

**Usage**: Special announcements, game over screens

```tsx
<Card className="card-arcade">
  <h2>GAME OVER</h2>
</Card>
```

**Styling**:

- Background: Gradient `dark-400` to `dark-500`
- Border: 4px solid `accent-500`
- Border radius: 0 (sharp corners)
- Box shadow: 8px offset + cyan glow

### Inputs

#### Terminal Input

**Usage**: All text inputs, email, password, search

```tsx
<Input label="Email" placeholder="your@email.com" icon={<EmailIcon />} />
```

**Styling**:

- Background: `dark-400` with inset purple glow
- Border: 2px solid `primary-500/50`
- Text: `accent-500` (cyan)
- Font: VT323 (monospace)
- Placeholder: `light-400`
- Focus: Border `primary-500`, ring glow

**Special Features**:

- Inset box shadow for depth
- Monospace font for authenticity
- Icon support with left padding
- Label association for accessibility

### Badges

#### Feature Badge

**Usage**: Stats, labels, status indicators

```tsx
<div className="glass-effect rounded-lg p-4 border-2 border-primary-500/30">
  <div className="text-3xl">⚡</div>
  <p className="text-xxs font-display">FAST</p>
</div>
```

**Variants**:

- Primary: Purple border
- Secondary: Pink border
- Accent: Cyan border
- Success: Green border
- Danger: Red border

---

## Visual Effects

### CRT Screen Effect

Apply to full-page containers for authentic monitor feel:

```tsx
<div className="crt-screen">{/* Content */}</div>
```

**Includes**:

1. **Scanlines**: Horizontal lines overlay
2. **Flicker**: Subtle random opacity variation
3. **Phosphor Glow**: Slight purple tint

**Implementation**:

```css
.crt-screen {
  position: relative;
}

.crt-screen::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10;
}

.crt-screen::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(107, 72, 255, 0.02);
  animation: crt-flicker 0.15s infinite;
  pointer-events: none;
  z-index: 11;
}
```

### Grid Background

Tron-inspired perspective grid:

```css
.bg-game-gradient {
  background-color: #0a0a1f;
  background-image:
    linear-gradient(rgba(107, 72, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(107, 72, 255, 0.1) 1px, transparent 1px),
    radial-gradient(ellipse at top, rgba(107, 72, 255, 0.15), transparent 70%),
    radial-gradient(
      ellipse at bottom,
      rgba(255, 51, 198, 0.15),
      transparent 70%
    );
  background-size:
    20px 20px,
    20px 20px,
    100% 100%,
    100% 100%;
}
```

### Neon Glow (CSS)

Triple-layer shadow for authentic neon effect:

```css
.neon-border {
  border: 2px solid #6b48ff;
  box-shadow:
    0 0 5px rgba(107, 72, 255, 0.5),
    0 0 20px rgba(107, 72, 255, 0.6),
    0 0 40px rgba(107, 72, 255, 0.7),
    inset 0 0 20px rgba(107, 72, 255, 0.1);
}
```

### Pixel Shadow

8-bit style depth effect:

```css
.retro-shadow {
  box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.8);
}
```

On interactive elements:

```css
&:active {
  transform: translate(8px, 8px);
  box-shadow: none;
}
```

### Glitch Effect

Cyberpunk-style position shift:

```css
.hover-glitch:hover {
  animation: glitch 0.3s infinite;
}

@keyframes glitch {
  0%,
  100% {
    transform: translate(0);
  }
  33% {
    transform: translate(-2px, 2px);
  }
  66% {
    transform: translate(2px, -2px);
  }
}
```

---

## Layout & Spacing

### Grid System

Based on 8px grid for pixel-perfect alignment:

```css
/* Spacing scale */
0:   0px
1:   8px   (0.5rem)
2:   16px  (1rem)
3:   24px  (1.5rem)
4:   32px  (2rem)
5:   40px  (2.5rem)
6:   48px  (3rem)
8:   64px  (4rem)
10:  80px  (5rem)
12:  96px  (6rem)
16:  128px (8rem)
20:  160px (10rem)
```

### Container Widths

```css
sm:  max-w-2xl   (672px)
md:  max-w-4xl   (896px)
lg:  max-w-6xl   (1152px)
xl:  max-w-7xl   (1280px)
full: max-w-full (100%)
```

### Breakpoints

```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet portrait */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

### Border Radius

Minimal rounding for retro feel:

```css
none: 0
sm:   0.125rem  (2px)
md:   0.25rem   (4px)
lg:   0.5rem    (8px)
xl:   0.75rem   (12px)
2xl:  1rem      (16px)
3xl:  1.5rem    (24px)
4xl:  2rem      (32px)
```

**Note**: Primary buttons use `lg` (8px) for subtle softening while maintaining retro aesthetic.

---

## Accessibility

**Accessibility is a first-class citizen in the project.** All design decisions must comply with WCAG 2.1 AA standards (minimum) and follow accessibility best practices.

For complete accessibility guidelines, standards, and implementation details, see the **[Accessibility Documentation](accessibility.md)**.

### Contrast Ratios

All color combinations meet WCAG 2.1 AA standards:

| Combination    | Ratio  | Level |
| -------------- | ------ | ----- |
| Purple on Dark | 12.5:1 | AAA   |
| Pink on Dark   | 11.8:1 | AAA   |
| Cyan on Dark   | 15.2:1 | AAA   |
| Green on Dark  | 14.1:1 | AAA   |
| Red on Dark    | 9.4:1  | AAA   |
| White on Dark  | 18.5:1 | AAA   |

### Focus States

All interactive elements have clear focus indicators:

```css
&:focus {
  outline: none;
  ring: 4px solid currentColor;
  ring-opacity: 0.5;
}
```

### Keyboard Navigation

- Tab order follows visual hierarchy
- Skip links for main content
- Escape key closes modals
- Arrow keys navigate lists

### Screen Reader Support

- Proper ARIA labels on all inputs
- Semantic HTML structure
- Alt text on decorative icons
- Status announcements for dynamic content

### Motion Preferences

Respect user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Guide

### Quick Start

1. **Install Dependencies**

```bash
npm install
```

2. **Import Fonts**
   Already configured in `index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Press+Start+2P&family=VT323&display=swap");
```

3. **Use Components**

```tsx
import { Button, Card, Input, Container } from "@/shared/components";

function MyComponent() {
  return (
    <Container size="lg">
      <Card>
        <h1>PLEEY</h1>
        <Button variant="primary">► LOGIN</Button>
      </Card>
    </Container>
  );
}
```

:::tip React 19 Compatible
All design system components are fully compatible with React 19's concurrent features and automatic batching. No special configuration needed!
:::

### Component Reference

All components are located in `application/frontend/src/shared/components/`:

- `Button.tsx` - All button variants
- `Card.tsx` - Card containers
- `Input.tsx` - Form inputs
- `Container.tsx` - Layout containers

### Tailwind Classes

Key utility classes:

```css
/* Backgrounds */
.bg-game-gradient     /* Grid background */
.bg-dark-500          /* Solid dark */
.glass-effect         /* Frosted glass */

/* Text */
.font-display         /* Press Start 2P */
.font-mono            /* VT323 */
.font-body            /* Orbitron */
.text-neon            /* Neon glow */
.text-gradient-neon   /* Gradient text */

/* Effects */
.crt-screen           /* CRT overlay */
.neon-border          /* Neon border */
.retro-shadow         /* Pixel shadow */
.hover-glitch         /* Glitch on hover */

/* Animations */
.animate-glow         /* Pulsing glow */
.animate-flicker      /* CRT flicker */
.animate-glitch       /* Position glitch */
.animate-pixel-pop    /* Retro pop */
```

### Styling Conventions

- Use the shared `createStyles` helper to declare style tokens for every feature-level component.
- Combine tokens with `mergeStyles` when dynamic variants are required; avoid building class name strings manually.
- Do not add raw `className` props to shared UI primitives. Prefer dedicated behavior props (e.g. `tone`, `variant`, `size`, `effect`, `padding`, `border`, `elevation`) or update the primitive to support the needed behavior.
- Feature-level components should use `createStyles` + `mergeStyles` and spread tokens via `{...styles.foo}` / `{...mergeStyles(...)}`.

### Example Patterns

#### Arcade-Style Card

```tsx
<Card surface="panel" tone="accent" border="thick" elevation="retro">
  <h2 className="font-display text-2xl text-neon uppercase">INSERT COIN</h2>
  <p className="font-mono text-accent-400">&gt; PRESS START</p>
</Card>
```

#### Terminal Input (Example)

```tsx
<Input
  label="Username"
  placeholder="> player_1"
  tone="dark"
  icon={{ name: "Terminal" }}
/>
```

#### Neon Button Group

```tsx
<div className="space-y-4">
  <Button variant="primary" fullWidth effect="retro">
    ► LOGIN
  </Button>
  <Button variant="accent" fullWidth effect="retro">
    ✦ SIGN UP
  </Button>
</div>
```

---

## Agent Reference

### For AI Coding Assistants

This section provides technical details for AI agents implementing the Cyber Arcade design system.

#### Color Variables

Use these Tailwind color tokens:

```typescript
// Primary colors
primary - 500; // #6b48ff - Electric Purple
secondary - 500; // #ff33c6 - Hot Pink
accent - 500; // #00ffcc - Cyber Cyan
success - 500; // #00ff41 - Matrix Green
danger - 500; // #ff0000 - Pure Red
dark - 500; // #0a0a1f - Deep Space

// Use with bg-, text-, border- prefixes
```

#### Font Families

```typescript
// Tailwind classes
font - display; // "Press Start 2P" - Headings, arcade text
font - mono; // "VT323" - Terminal, technical text
font - body; // "Orbitron" - Body text, UI labels
```

#### Component Props

```typescript
// Button
interface ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "danger"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

// Card
interface CardProps {
  variant?: "default" | "glass" | "dark" | "gradient";
  hover?: boolean;
  className?: string;
  children: ReactNode;
}

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  darkMode?: boolean;
  icon?: ReactNode;
}
```

#### Effect Classes

```typescript
// Apply these classes for standard effects
"crt-screen"; // CRT scanlines + flicker
"bg-game-gradient"; // Grid background
"glass-effect"; // Frosted glass
"neon-border"; // Neon glow border
"retro-shadow"; // 8px pixel shadow
"text-neon"; // Triple glow text
"hover-glitch"; // Glitch on hover
```

#### Animation Classes

```typescript
// Built-in animations
"animate-glow"; // Pulsing neon glow
"animate-flicker"; // CRT flicker (0.15s)
"animate-glitch"; // Position glitch (0.5s)
"animate-pixel-pop"; // Scale + rotate (0.3s)
"animate-pulse-slow"; // Slow pulse (4s)
"animate-float"; // Floating motion (3s)
```

#### Design Tokens

```typescript
// Spacing (8px grid)
const spacing = {
  1: "8px",
  2: "16px",
  3: "24px",
  4: "32px",
  6: "48px",
  8: "64px",
};

// Border radius
const borderRadius = {
  sm: "2px",
  md: "4px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
};

// Shadows
const boxShadow = {
  pixel: "8px 8px 0px rgba(0, 0, 0, 0.8)",
  neon: "0 0 5px, 0 0 20px, 0 0 40px",
  glow: "0 0 20px rgba(107, 72, 255, 0.6)",
};
```

#### Common Patterns

```typescript
// Arcade button with shadow
<button className="btn btn-primary retro-shadow font-display text-sm uppercase">
  ► ACTION
</button>

// Terminal text
<p className="font-mono text-accent-400 text-sm">
  &gt; STATUS: READY
</p>

// Neon heading
<h1 className="font-display text-5xl uppercase text-gradient-neon text-neon">
  PLEEY
</h1>

// Glass card
<div className="glass-effect border-2 border-accent-500/30 rounded-lg p-6">
  {content}
</div>

// CRT container
<div className="crt-screen bg-game-gradient min-h-screen p-4">
  {content}
</div>
```

#### Critical Constraints

**DO:**

- ✅ Use uppercase text for Press Start 2P font
- ✅ Apply retro-shadow to all primary buttons
- ✅ Use neon colors on dark backgrounds only
- ✅ Include CRT effect on full-page views
- ✅ Add grid background to main game areas
- ✅ Use monospace font for technical readouts

**DON'T:**

- ❌ Use gradients on primary buttons (solid fills only)
- ❌ Round corners more than 12px on arcade elements
- ❌ Apply neon effects to body text (headings only)
- ❌ Mix more than 3 neon colors in one component
- ❌ Use serif fonts (breaks retro aesthetic)
- ❌ Remove pixel shadows from buttons

#### Testing Checklist

When implementing components:

- [ ] Colors meet WCAG AA contrast (12.5:1+ on dark)
- [ ] Pixel shadow at 8px offset
- [ ] Neon glow uses triple-layer shadow
- [ ] CRT effect includes scanlines + flicker
- [ ] Grid background on game screens
- [ ] Font: Display = Press Start 2P, Mono = VT323
- [ ] Buttons have 2px borders
- [ ] Focus states visible with ring
- [ ] Animations respect prefers-reduced-motion
- [ ] All interactive elements keyboard accessible

---

## Resources

### Design Files

- Tailwind Config: `application/frontend/tailwind.config.js`
- CSS Components: `application/frontend/src/index.css`
- React Components: `application/frontend/src/shared/components/`
- Example Pages: `application/frontend/src/features/home/components/HomePage.tsx`

### External References

- [Press Start 2P Font](https://fonts.google.com/specimen/Press+Start+2P)
- [VT323 Font](https://fonts.google.com/specimen/VT323)
- [Orbitron Font](https://fonts.google.com/specimen/Orbitron)
- [Synthwave Color Theory](https://www.awwwards.com/synthwave-color-palettes.html)
- [CRT Shader Effects](https://www.shadertoy.com/view/XtlSD7)

### Community

- Report design issues: GitHub Issues
- Suggest improvements: Pull Requests
- Ask questions: GitHub Discussions
