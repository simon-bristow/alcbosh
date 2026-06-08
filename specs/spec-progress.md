# Spec — Progress bars + AF streak

Covers the two stacked progress bars on the Today screen and the alcohol-free day counter.

## Week progress

- **Window**: current Mon 00:00 → next Mon 00:00 (`weekBounds()` in `units.js`)
- **Total**: sum of `units` for all drinks within the window
- **Cap**: `settings.weeklyCap` (default 10)
- **Bar fill %**: `min(100, weekUnits / weeklyCap × 100)`
- **State** (color):
  - `weekUnits >= weeklyCap` → red (`bg-red-500`)
  - `weekUnits >= weeklyCap × 0.75` → amber (`bg-amber-400`)
  - otherwise → emerald (`bg-emerald-400`)

Label format: `X.X / N units` (top right of the card).

## Daily progress / warning indicator

Separate card below week progress. Same component (`Bar`), different inputs:

- **Window**: today only (`sameDay(d.at, now)`)
- **Cap**: `settings.dailyWarn` (default 2)
- **State** thresholds: same `0.75` and `1.0` ratios → ok / warn / over
- **Inline message** below bar:
  - `over` → "Over daily limit." (red text)
  - `warn` → "Approaching daily limit." (amber text)
  - `ok` → no message

Number label takes the state color too (red / amber / muted).

## AF-day streak

Counts consecutive alcohol-free days **ending at most yesterday**. Implementation in `units.js` `afStreak()`:

1. If today has any drinks → return 0
2. Otherwise walk backwards day-by-day; stop when a day has drinks
3. Cap at 365 to avoid runaway loops on empty data

**Display rules:**
- Always shown as text inside the empty-state for "Today's drinks" if `streak > 0` and `today.length === 0`: `"N alcohol-free days so far."`
- Additionally shown as a large emerald hero card at the bottom of Home when `streak > 0 && today.length === 0`

If the user logs a drink today, the streak text disappears (resets to 0 implicitly until tomorrow).

## Bar component

Single `<Bar pct={...} state={'ok'|'warn'|'over'} />`. Background track is `bg-white/10`; fill transitions width via Tailwind's `transition-all`.
