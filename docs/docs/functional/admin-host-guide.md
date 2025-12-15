---
sidebar_position: 3
---

# 👑 Admin Host Game Experience

## Overview

The admin host game experience transforms the admin's role from a player to a game animator/host. When an admin launches a game, they are presented with specialized views optimized for screen sharing, allowing them to guide players through the quiz while displaying questions, statistics, and results in a clear, engaging format.

## Key Features

### 🎮 **Host-Only Views**

Admins see different views than regular players during the game:

1. **Lobby View** - Enhanced with "HOST MODE" badge and screen share reminder
2. **Playing View** - Display-only mode with large, clear question display
3. **Results View** - Enhanced leaderboard with cinematic animations
4. **Controls** - Admin-specific controls for game flow management

### 🚫 **No Player Participation**

- Admin **cannot** answer questions
- Admin **cannot** earn points
- Admin focuses solely on animating the game experience

### 📺 **Screen Share Optimized**

All admin views are designed for maximum visibility when screen sharing:

- Extra large fonts and emojis
- High contrast colors following Cyber Arcade design system
- Clear, prominent information display
- Minimal clutter, maximum readability

## Admin Flow

### 1. **Launch Game** (from Admin Dashboard)

```
Admin Dashboard → Select Quiz → Click "Launch" → Lobby
```

- Admin is automatically taken to the lobby
- A unique PIN is displayed prominently
- "HOST MODE" badge appears at the top
- Screen share reminder is shown

### 2. **Lobby Phase** (Waiting for Players)

**Admin sees:**

- 👑 **HOST MODE** badge with screen share reminder
- Large PIN display (optimized for screen sharing)
- Instructions for players on how to join
- Live player count with heartbeat animation
- Connected players grid with avatars
- "START GAME" button (enabled when ≥1 player joins)

**Players see:**

- Standard lobby view
- Waiting message for host to start

### 3. **Playing Phase** (Questions)

**Admin sees:**

- 👑 **HOST VIEW - SCREEN SHARE MODE** badge
- Enhanced question display:
  - Extra large question text (7xl font size)
  - Question type indicator (Multiple Choice / True or False)
  - Prominent timer with color-coded urgency
    - 🟢 Green: >10 seconds remaining
    - 🟡 Yellow: 5-10 seconds remaining
    - 🔴 Red: ≤5 seconds (pulsing animation)
  - Progress bar showing time remaining
  - Question counter (e.g., "1 / 5")
  - Answer options displayed (non-interactive)
  - "Waiting for players to answer..." message

**During Results:**

- 🎯 **RESULTS** heading with large emoji
- Correct answer displayed prominently
- **Live answer statistics:**
  - Bar charts showing how many players chose each option
  - Percentage breakdown
  - Player count per option
  - Correct answer highlighted in green
- **NEXT QUESTION** button (admin-only)

**Players see:**

- Standard playing view with interactive answer buttons
- Same timer and progress
- Can submit their answers
- See their own results

### 4. **Leaderboard Phase** (Game End)

**Admin sees:**

- 👑 **HOST VIEW** badge
- **GAME OVER** title with dramatic entrance
- 🏆 Trophy emoji
- **Final Leaderboard** heading
- **Enhanced podium:**
  - 🥇 1st place: Extra large, golden, animated
  - 🥈 2nd place: Silver, prominent
  - 🥉 3rd place: Bronze, displayed
  - All with cinematic reveal animations
- **Other Top Players** section (ranks #4+)
- **Admin Controls** panel:
  - "BACK TO ADMIN DASHBOARD" button
  - "NEW GAME" button
- Confetti animation (stops after 10 seconds)

**Players see:**

- Standard leaderboard view
- "Play Again" and "Share" buttons

## Best Practices for Admins

### During Setup

1. ✅ **Start screen sharing** before launching the game
2. ✅ **Share the entire window** for best visibility
3. ✅ **Maximize the browser** to fill the screen
4. ✅ **Test audio** if using voice narration

### During Lobby

1. ✅ **Clearly display the PIN** - it's already large, but point it out verbally
2. ✅ **Wait for all expected players** to join
3. ✅ **Announce player names** as they join
4. ✅ **Start when ready** - minimum 1 player required

### During Questions

1. ✅ **Read the question aloud** for accessibility
2. ✅ **Read all answer options** before starting timer
3. ✅ **Build suspense** as timer counts down
4. ✅ **Wait for all players** to submit before showing results
5. ✅ **Review statistics** - discuss interesting patterns
6. ✅ **Advance at your own pace** - click NEXT QUESTION when ready

### During Results

1. ✅ **Let animations complete** - they're designed for drama
2. ✅ **Celebrate the winner** - call out top 3
3. ✅ **Thank all players** for participating
4. ✅ **Choose next action** - return to dashboard or start new game

## Keyboard Shortcuts

Currently not implemented, but could be added:

- `Space` - Start game / Next question / Advance
- `Esc` - Return to admin dashboard

## Troubleshooting

### "I accidentally answered a question as admin"

This should not be possible. Admin host views do not include answer submission capabilities.

### "Players can't see my screen"

Ensure you're screen sharing the entire browser window or tab, not just a portion of the screen.

### "Animations are too slow/fast"

Animation timings are fixed in the code. To adjust:

- Lobby: Modify animation delays in `LobbyPage.tsx`
- Playing: Modify timer intervals in `AdminHostPlayingView.tsx`
- Leaderboard: Modify animation sequence in `AdminHostLeaderboardView.tsx`

### "Text is too small on projector"

The UI is already optimized for large displays. If still too small:

1. Use browser zoom (Ctrl/Cmd + `+`)
2. Increase display resolution
3. Move closer to the screen/projector
