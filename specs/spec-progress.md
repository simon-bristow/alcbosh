# Spec — Day, Week, and AF Streak panels

Covers the two stacked panels at the top of the Today screen — the selected-day total (with prev/next nav) and the combined week block (total + 7-day heatmap) — plus the alcohol-free-day counter.

Free-day markers are filtered out of all unit totals — they only affect the streak and the inline "Free day ✓" indicator.

## Day panel (top)

Renders a card with:

- **Prev / Next arrows** (`←` / `→`) flanking the day label
- **Day label** — `Today` / `Yesterday` / `Sat 6 Jun` (short weekday + day + short month). Clickable when not on today → jumps to today.
- **Day total** — sum of real units on the selected day vs `settings.dailyWarn`
- **Bar** color state (same thresholds as week):
  - `dayUnits >= dailyWarn` → red
  - `dayUnits >= dailyWarn × 0.75` → amber
  - else → emerald
- Inline messages below the bar:
  - over → `Over daily limit.` (red)
  - warn → `Approaching daily limit.` (amber)
  - free-day marker exists & no real drinks → `Free day ✓` (emerald)

Next arrow disabled when `viewDate === today` (no future browsing).

## Combined week block

One card containing both the weekly total and the 7-day heatmap of the visible week.

### Header

- Label: `This week` (when viewDate is in the current week) OR `Week of D MMM` (otherwise)
- Right side: `X.X / N units` (real units only)

### Bar

Single `<Bar pct={...} state={...} />`. Same color thresholds as the day bar but scaled to `settings.weeklyCap`.

### 7-day heatmap

7 columns Mon–Sun. Each day cell:

- `bg-emerald-500` (varying opacity by intensity) for `0 < u < dailyWarn`
- `bg-red-500/70` for `u >= dailyWarn`
- `bg-emerald-500/15` for free-day-only days (`u == 0 && free`)
- `bg-white/5` for empty days
- Ring `ring-2 ring-white/40` for the selected `viewDate`
- Future days: `opacity-30`

Letter label `M T W T F S S` below each cell.

Tooltip: `<Date>: X.Xu | Free day | no entry`.

## AF-day streak

Counts consecutive alcohol-free days **ending at most yesterday** (or today if it's still alcohol-free). Implementation in `units.js` `afStreak()`:

1. Build `daysWithRealDrinks` set from `drinks.filter(isReal)` keyed by ISO date — free-day markers are NOT included here, so explicitly-marked free days extend the streak.
2. If today has any real drink → return 0.
3. Walk backwards day-by-day; stop when a day has any real drink.
4. Cap iterations at 365.

**Display rules** (only when viewing today, i.e. `isViewingToday`):
- If `recent.length === 0`, the empty-state shows `"N alcohol-free days so far."`
- Large emerald hero card at the bottom of Home when `streak > 0 && viewDayReal.length === 0`

If the user logs a real drink today, the streak resets to 0 (until tomorrow).

## Bar component

Single `<Bar pct={...} state={'ok'|'warn'|'over'} />`. Background track is `bg-white/10`; fill transitions width via Tailwind's `transition-all`.
