# Spec — Progress bars + AF streak

Covers the two stacked progress bars on the Today screen and the alcohol-free day counter.

Free-day markers (see `spec-logging.md`) are filtered out of all unit totals — they only affect the streak and the "Free day ✓" indicator.

## Week progress

- **Window**: current Mon 00:00 → next Mon 00:00 (`weekBounds()` in `units.js`)
- **Source**: `thisWeek.filter(isReal)` — free-day markers excluded
- **Total**: sum of `units`
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
- **Source**: `todayReal = today.filter(isReal)` — free-day markers excluded
- **Cap**: `settings.dailyWarn` (default 2)
- **State** thresholds: same `0.75` and `1.0` ratios → ok / warn / over
- **Inline messages** below bar (mutually exclusive, in priority order):
  - `over` → "Over daily limit." (red text)
  - `warn` → "Approaching daily limit." (amber text)
  - free-day marker exists and no real drinks → "Free day ✓" (emerald text)

Number label takes the state color too (red / amber / muted).

## AF-day streak

Counts consecutive alcohol-free days **ending at most yesterday** (or today if it's still alcohol-free). Implementation in `units.js` `afStreak()`:

1. Build `daysWithRealDrinks` set from `drinks.filter(isReal)` keyed by ISO date — free-day markers are NOT included here, so explicitly-marked free days extend the streak.
2. If today has any real drink → return 0.
3. Walk backwards day-by-day; stop when a day has any real drink.
4. Cap iterations at 365.

**Display rules:**
- Inside the empty-state for "Today's drinks": `"N alcohol-free days so far."` when `streak > 0 && today.length === 0`
- Large emerald hero card at the bottom of Home when `streak > 0 && todayReal.length === 0` (so it stays visible even if a free-day marker was logged today)

If the user logs a real drink today, the streak resets to 0 (until tomorrow).

## Bar component

Single `<Bar pct={...} state={'ok'|'warn'|'over'} />`. Background track is `bg-white/10`; fill transitions width via Tailwind's `transition-all`.
