# Visual Reference Guide - Game Session Start

Quick reference for the visual improvements made to JoinGamePage and LobbyPage.

## 🎨 Color Palette Used

```css
/* Primary Colors */
#6b48ff  primary-500   Electric Purple  (borders, main actions)
#ff33c6  secondary-500 Hot Pink         (highlights, gradients)
#00ffcc  accent-500    Cyber Cyan       (main text, interactive)
#00ff41  success-500   Matrix Green     (status indicators)
#ff0000  danger-500    Pure Red         (errors)
#0a0a1f  dark-500      Deep Space       (backgrounds)
```

## 📐 Key Components & Classes

### JoinGamePage

```tsx
// Main Container
<div className="min-h-screen bg-game-gradient crt-screen">

// Background Orbs
<div className="absolute ... bg-secondary-500/10 ... animate-float">

// Header
<h1 className="font-display text-4xl sm:text-5xl uppercase text-neon text-accent-500">

// PIN Input
<input className="
  bg-dark-500 
  border-4 border-accent-500/50 
  text-4xl sm:text-6xl 
  font-display 
  tracking-[0.5em] 
  text-accent-400 
  shadow-neon-accent
">

// Pixel Indicators
<div className="
  w-4 h-4 
  bg-accent-500 
  shadow-neon-accent 
  scale-125 
  rotate-45
">

// Button
<Button 
  variant="accent" 
  size="xl" 
  fullWidth 
  className="retro-shadow"
>
```

### LobbyPage

```tsx
// Main Container
<div className="min-h-screen bg-game-gradient crt-screen">

// Instructions Banner
<div className="glass-effect rounded-xl p-6 border-2 border-primary-500/30">

// PIN Display
<div className="
  bg-dark-500 
  border-4 border-accent-500 
  shadow-neon-accent 
  animate-pulse-slow
">
  <div className="
    font-display 
    text-9xl 
    text-accent-400 
    tracking-[0.3em] 
    text-neon
  ">

// Player Count with Heartbeat
<span className={`
  text-5xl 
  transition-transform 
  ${heartbeat ? 'scale-110' : 'scale-100'}
`}>

// Connection Status
<span className="relative flex h-4 w-4">
  <span className="animate-ping absolute ... bg-success-400">
  <span className="relative ... bg-success-500">
</span>

// Player Card
<Card 
  hover 
  className="
    border-2 
    border-accent-500/20 
    hover:border-accent-500
    animate-scale-in
  "
>
```

## 🎭 Animation Effects

```css
/* Float (Background Orbs) */
animate-float: 3s ease-in-out infinite
  0%, 100%: translateY(0px)
  50%: translateY(-20px)

/* Pulse Slow */
animate-pulse-slow: 4s cubic-bezier infinite

/* Scale In */
animate-scale-in: 0.3s ease-out
  0%: scale(0.9), opacity(0)
  100%: scale(1), opacity(1)

/* Pixel Pop */
animate-pixel-pop: 0.3s ease-out
  0%: scale(0.8) rotate(-5deg)
  50%: scale(1.1) rotate(5deg)
  100%: scale(1) rotate(0deg)

/* Glow */
animate-glow: 2s ease-in-out infinite
  0%, 100%: opacity(1), shadow(20px)
  50%: opacity(0.8), shadow(40px)

/* CRT Flicker */
animate-flicker: 0.15s infinite
  Random opacity values (0.08 - 0.96)
```

## 📱 Responsive Breakpoints

```tsx
// Text Sizing Progression
className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-9xl"

// Padding Progression
className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"

// Grid Columns
className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"

// Spacing
className="gap-3 sm:gap-4 md:gap-5 lg:gap-6"
```

## 🎯 Key Visual Effects

### CRT Screen
```css
.crt-screen::before {
  /* Scanlines */
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
}

.crt-screen::after {
  /* Flicker */
  background: rgba(107, 72, 255, 0.02);
  animation: crt-flicker 0.15s infinite;
}
```

### Neon Glow
```css
.text-neon {
  text-shadow: 
    0 0 7px currentColor,
    0 0 10px currentColor,
    0 0 21px currentColor,
    0 0 42px currentColor;
}

.shadow-neon-accent {
  box-shadow: 
    0 0 5px #4dffdd,
    0 0 20px #00ffcc,
    0 0 40px #00d6ad;
}
```

### Retro Shadow
```css
.retro-shadow {
  box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.8);
}

/* On interaction */
&:active {
  transform: translate(8px, 8px);
  box-shadow: none;
}
```

### Glass Effect
```css
.glass-effect {
  background: rgba(45, 45, 112, 0.3);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(0, 255, 204, 0.2);
}
```

## 🔤 Typography Scale

```css
font-xxs:   0.625rem  (10px)  - Small labels
font-xs:    0.75rem   (12px)  - Captions
font-sm:    0.875rem  (14px)  - Small body
font-base:  1rem      (16px)  - Body text
font-lg:    1.125rem  (18px)  - Large body
font-xl:    1.25rem   (20px)  - Small headings
font-2xl:   1.5rem    (24px)  - Subheadings
font-3xl:   1.875rem  (30px)  - Headings
font-4xl:   2.25rem   (36px)  - Large headings
font-5xl:   3rem      (48px)  - Display text
font-6xl:   3.75rem   (60px)  - Hero text
font-7xl:   4.5rem    (72px)  - Extra large
font-8xl:   6rem      (96px)  - Massive
font-9xl:   8rem      (128px) - Ultra (PIN display)
```

## 🎪 Icon Usage

### Emoji Icons
```tsx
// Player Avatars (rotating)
['🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐷', '🐵', '🐶']

// Status Icons
'🎮' // Game controller (join page)
'👥' // People (player count)
'💚' // Green heart (connected)
'🤍' // White heart (waiting)
'💡' // Light bulb (tips)
'👤' // Empty slot
'📋' // Copy button

// Arrows
'◄' // Left arrow (back)
'►' // Right arrow (play/start)
'▶' // Play symbol
'◀' // Play left
'•' // Bullet point
```

## 🎨 Component Variants

### Button Variants
```tsx
variant="primary"   // Purple bg, white text
variant="secondary" // Pink bg, white text
variant="accent"    // Cyan bg, dark text
variant="success"   // Green bg, dark text
variant="danger"    // Red bg, white text
variant="outline"   // Transparent, border only
variant="ghost"     // Semi-transparent, blur
```

### Card Variants
```tsx
variant="default"   // White bg (light mode)
variant="glass"     // Frosted glass
variant="dark"      // Pure dark bg
variant="gradient"  // Purple to pink gradient
```

## 📊 Layout Patterns

### Container Sizes
```tsx
size="sm"   // max-w-2xl  (672px)
size="md"   // max-w-4xl  (896px)
size="lg"   // max-w-6xl  (1152px)
size="xl"   // max-w-7xl  (1280px)
```

### Spacing (8px Grid)
```tsx
gap-1   // 8px
gap-2   // 16px
gap-3   // 24px
gap-4   // 32px
gap-6   // 48px
gap-8   // 64px
```

### Border Radius
```tsx
rounded-lg    // 8px  (buttons)
rounded-xl    // 12px (cards)
rounded-2xl   // 16px (inputs)
rounded-3xl   // 24px (large cards)
```

## 🎬 Animation Delays

```tsx
animation-delay-100  // 0.1s
animation-delay-200  // 0.2s
animation-delay-300  // 0.3s
animation-delay-400  // 0.4s

// Staggered Player Cards
style={{ animationDelay: `${index * 0.05}s` }}
```

## ✨ Pro Tips

### High Visibility (Screen Sharing)
- Use text-7xl or larger for important text
- Use accent-500 (#00ffcc) for maximum contrast
- Add text-neon for extra visibility
- Use border-4 instead of border-2

### Mobile Optimization
- Minimum touch target: 44px (iOS standard)
- Use py-5 (20px) or larger on buttons
- Text should be at least font-base (16px)
- Use sm: breakpoint for tablet adjustments

### Performance
- Use CSS animations, not JavaScript
- Use transform instead of position changes
- Use opacity instead of visibility
- Keep animations under 300ms for responsiveness

### Accessibility
- Always include aria-label on inputs
- Use semantic HTML (button, not div)
- Ensure 4.5:1 contrast minimum (WCAG AA)
- Add focus:ring-4 for keyboard navigation

---

**Quick Copy/Paste Examples**

```tsx
// Arcade Heading
<h1 className="font-display text-5xl uppercase text-neon text-accent-500 tracking-wider">
  ► YOUR TEXT HERE ◄
</h1>

// Terminal Text
<p className="font-mono text-accent-400 text-sm">
  &gt; Status: Ready
</p>

// Neon Button
<button className="btn btn-accent retro-shadow font-display text-lg uppercase">
  ► CLICK ME ◄
</button>

// Glass Card
<div className="glass-effect rounded-xl p-6 border-2 border-accent-500/30">
  Content
</div>

// Pulsing Status
<span className="relative flex h-3 w-3">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
</span>
```
