# Hosting a party

A party is a live session of one game. Only the account that created the party can control it.

## Create a party

1. On the dashboard, find the game and click **Create party**.
2. Review the **Play mode** toggles. They start from the project's defaults. The badge shows **Default mode** or **Custom mode**.
3. To restrict access, turn on **Make this a private party** and set a **Private party password** (at least 6 characters). **Generate secure password** and **Copy password** help you share it.
4. Click **Create party**. You land in the lobby.

The bar at the top of every party screen shows the PIN, the status, the number of players, the main action (**Start party**, **Next stage**, **Display final leaderboard**) and the **Host commands** menu.

The button is disabled when:

- the game has no stage;
- a party is already active for this game;
- you already host another active party.

## Party settings

Each party has four settings:

| Setting | Default | Effect |
| --- | --- | --- |
| Allow players to join after the party has started | off | Late players can join during the game. Players who already joined can always rejoin. |
| Allow players to change answer after voting | on | Players can switch answers until the timer ends. The last answer counts. |
| Randomize stage order | off | Stages are shuffled for this party. |
| Randomize outcome order | off | Answers are shuffled on each stage. |

Defaults are set at the organization level, then at the project level, then per party. Each level overrides the one before.

## Invite players

The lobby shows a **Join the lobby** panel with three ways to join:

- a **QR code** to scan;
- a link of the form `https://your-pleey-host/join/123456`, with a **Copy join link** button;
- the 6-digit code itself.

Players must open the link or scan the code. There is no page where a player types a PIN by hand, so share the full link, not just the number.

## The lobby

- **Players** lists everyone who joined. **Kick player** removes someone after confirmation.
- The **Host commands** menu holds a music picker (labelled **Party animation**): No music, Chill, Funky, Suspense, Retro or Party. Music plays on your device only.
- **Start party** becomes available once at least one player has joined.

## Running the stages

Each stage goes through two steps: the question, then the result.

### Question

Your screen shows **Stage X of Y**, the question, the answers, the countdown and **Responses received: N / total**. Players answer on their own device.

### Reveal the result

Open **Host commands** and click **Reveal result**, or press `R`. The result is also revealed automatically when the timer runs out, or when every player has answered and answer changes are not allowed.

The result screen shows the answer distribution with vote counts, the correct answer, and **Live standings** with each player's rank change (Up, Down, Hold, New).

### Next stage

Click **Next stage** in the top bar, or press `N`. On the last stage, the button reads **Display final leaderboard**.

## Host commands

The **Host commands** menu offers:

| Command | Shortcut | Effect |
| --- | --- | --- |
| Pause party / Resume party | `P` | Freezes the timer. Players see "The host paused the party." |
| Previous stage | `Shift+B` | Goes back one stage. |
| Restart stage | `Shift+R` | Replays the current stage. |
| Back to lobby | `Shift+L` | Returns everyone to the lobby. |
| End party | `Shift+E` | Ends the party and returns you to the dashboard. |

The last four ask for confirmation. Going back, restarting or returning to the lobby clears the answers and points of the affected stages. Players are told when that happens.

## End of the party

The final screen (**Game over!**) shows:

- the winner;
- the **Podium** with the top three;
- the **Standings** with points and correct answers for everyone. Ties are ordered alphabetically by username.

Click **Dashboard** in the header to leave. Ending a party disconnects the players.

While a party is open, Pleey keeps the screen awake.
