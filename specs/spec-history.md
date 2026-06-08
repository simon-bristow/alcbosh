# Spec — History view

Renders past weeks with a 7-day heatmap per week, most recent first.

## Grouping

All `drinks` (any age) are bucketed by `weekBounds(d.at).start` (Mon-00:00 ISO string). Buckets sorted descending by start date.

If no drinks have ever been logged: `"No history yet."` and nothing else.

## Per-week card

Each week renders as a card with:

- **Header row**:
  - Left: week-start date, formatted as `D MMM` (e.g. `2 Jun`)
  - Right: `X.X / N u` — total units that week vs `settings.weeklyCap`
  - Right text is red if `total >= weeklyCap`, otherwise muted
- **7-day heatmap**: a 7-column grid

## Heatmap cells

Each cell represents one day of the week (Mon–Sun). For each day:

- Compute `u = sum of units logged that day` (0 if none)
- Render an 8px-tall rounded bar with:
  - `u === 0` → `bg-white/5` (almost invisible)
  - `u >= settings.dailyWarn` → `bg-red-500/70` (over-limit day)
  - `0 < u < settings.dailyWarn` → `bg-emerald-500` with opacity `0.3 + (u/dailyWarn) × 0.7` (gradient up to full at the warn line)
- Tooltip (`title` attr): `"Mon Jun 02 2026: 2.8u"`
- Label below cell: single letter `M T W T F S S`

## Future enhancements (not implemented)

- Tap a week to expand the day-by-day drink list
- Sparkline of weekly totals across the full history
- CSV export
