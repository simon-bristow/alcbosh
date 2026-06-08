# Spec — Calendar view

Month grid showing total units consumed per day, with free-day markers and at-a-glance month stats. Accessed via the "Cal" header tab.

## Layout

```
←   <Month YYYY>   →

M T W T F S S
[grid of day cells, 6 rows max]

[summary card]
  Month total       X.Xu
  Drinking days     N
  Free days marked  N
```

## Month navigation

- `← / →` buttons step by one calendar month
- `→` is **disabled** when viewing the current month (no future browsing)
- Initial month = current month at mount

## Grid layout

- Monday-start (matches the rest of the app)
- 7 columns; rows pad to multiples of 7 with blank cells for leading/trailing days
- Each day cell is `aspect-square` so the grid scales with the container

## Day cell rendering

For each real calendar day, compute:
- `u = unitsByDay(drinks)[isoDate]` — sum of real drink units
- `free = freeDaysByDay(drinks)[isoDate]` — boolean, true if a free-day marker exists that day
- `isToday`, `future` from a single `today = new Date()` reference

**Background color** (in priority):
| Condition | bg |
|---|---|
| `u >= settings.dailyWarn` | `bg-red-500/40` |
| `u > 0` | `bg-emerald-500/30` |
| free marker only | `bg-emerald-500/10` |
| otherwise | `bg-white/5` |

**Text inside the cell**:
- Day number (always)
- Below: `fmtUnits(u)` if `u > 0`
- Below: `✓` if `free && !u && !future`
- Future days: text fades to `text-white/20`

**Today**: cell gets `ring-2 ring-white/40` to highlight.

**Tooltip**: `title="<Date>: X.Xu" / "Free day" / "No entry"`.

## Summary card

Below the grid:
- **Month total** — sum of units across all real drinks dated in the displayed month
- **Drinking days** — count of distinct dates with `u > 0`
- **Free days marked** — count of distinct dates with `free && !(u > 0)` (a real drink supersedes a free-day marker for this count)

All three derived from the same `cells` array used to render the grid (already filtered to in-month dates).

## Source helpers

`units.js`:
- `unitsByDay(drinks)` → `{ [isoDate]: number }` — sums real drink units per day
- `freeDaysByDay(drinks)` → `{ [isoDate]: true }` — set of free-day dates

Both filter via the canonical `isReal` / `isFreeDay` predicates.

## Future enhancements (not implemented)

- Tap a day cell to view that day's drinks
- Mark past days as free-days (currently only today's marker is supported)
- Swipe-left/right between months
- Pagination of months in a year-overview ribbon
