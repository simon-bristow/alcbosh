# Spec — Logging drinks

Covers quick-add tiles (with long-press for one-off ABV), free-day marker, custom-drink modal, units calculation, and edit/delete of existing entries.

## Quick-add tiles

Three tiles rendered on the Today screen. Each is a single tap → one drink logged with the tile's `ml` + `abv` defaults and `name = tile.label`.

Defaults (from `units.js` `DEFAULT_TILES`, displayed left-to-right):

| Label | ml | ABV | Computed units |
|---|---|---|---|
| Pot | 285 | 5.0 | 1.4 |
| Bottle | 330 | 5.0 | 1.7 |
| Pint | 568 | 5.0 | 2.8 |

Tile renders show: label, `ml · ABV%`, and the precomputed unit value as `+X.Xu`. Tiles are editable in Settings — label, ml, and ABV can all be changed; new defaults persist to localStorage.

### Long-press → custom ABV

Long-pressing a tile (≥500ms hold, no significant pointer movement) opens the **AbvQuickModal** instead of logging a default drink:

- Pre-filled with the tile's current ABV
- Live preview of `units = calcUnits(tile.ml, abv)`
- "Log drink" button writes a one-off entry using `tile.ml + tile.label + the new ABV`
- Does NOT persist the new ABV as the tile default — that requires Settings
- Cancel dismisses without logging

Implementation in `App.jsx` `useLongPress({ onLong, ms = 500 })` hook. The hook returns pointer events + a click-wrapper; the wrapper suppresses the synthetic click that follows a long-press so the same gesture never both opens the modal and logs a default drink. Movement of >10px during the hold cancels the timer.

The wider `onContextMenu: preventDefault` stops mobile Safari from popping the text-selection bubble during a long-press.

### Tile reorder migration

`units.js` `migrate()` runs once when settings are loaded. If the stored `tiles` array exactly matches the old default `[pot, pint, bottle]` with default ml/ABV, it's replaced with the new default `[pot, bottle, pint]`. Customized stores are left alone.

## Free day

Button on the Today screen, next to "+ Custom". Logs a sentinel entry:

```js
{ name: 'Free day', ml: 0, abv: 0, units: 0, freeDay: true }
```

### State machine

| Today's entries | Button label | Enabled? |
|---|---|---|
| no real drinks, no free-day marker | "Free day" | yes |
| no real drinks, has free-day marker | "Free day ✓" | no (already marked) |
| any real drinks | "Free day" | no (greyed out) |

The "Today" progress card also shows a small green "Free day ✓" line below the bar when the marker exists and no real drinks have been logged.

`isFreeDay(drink)` and `isReal(drink)` helpers in `units.js` are the canonical predicates. Free-day entries never contribute to weekly/daily unit totals.

## Custom drink

Triggered by the "+ Custom" button. Opens a modal with:

- **Name** (optional, free text)
- **Size (ml)** — number input
- **ABV (%)** — number input, `step="0.1"`
- Live preview: `= X.X units`

Initial values: `{ name: '', ml: 330, abv: 5 }`.

Save → adds to drinks with `units = calcUnits(ml, abv)`.

## Units formula

UK standard unit = 10ml of pure alcohol.

```
units = (ml × abv%) / 1000
```

Implemented in `units.js` `calcUnits(ml, abv)`. Recomputed on every save (never stored stale).

Display formatting via `fmtUnits(n)` — always 1 decimal place (`2.8`, `0.0`, `10.5`).

## Today's drinks list

Below the tiles. Filters `drinks` to entries where `sameDay(d.at, now)`. Each row shows:

- Real drink: `name · ml · ABV%` + `HH:MM · X.Xu` + Edit + Delete
- Free-day marker: `Free day ✓` (green) + `HH:MM` + Delete only (no Edit)

Empty state: `Nothing logged yet.` or `N alcohol-free days so far.` if streak > 0.

## Edit flow

Edit reuses `DrinkModal` with `initial={drink}`. On save, calls `update(dataUid, id, { name, ml, abv, units })` — `units` always recomputed from the new ml/abv. Free-day entries cannot be edited (the Edit button is hidden).

## Delete flow

No confirmation. Optimistic UI via Firestore (or localStorage) subscription — the list updates as soon as the backend acknowledges.

## Data shape

```js
{
  id: string,         // UUID
  name: string|null,  // tile label or custom name; 'Free day' for markers
  ml: number,         // 0 for free-day markers
  abv: number,        // 0 for free-day markers
  units: number,      // 0 for free-day markers; recomputed on every write otherwise
  freeDay?: boolean,  // true on free-day markers
  at: Date            // logged-at time (serverTimestamp in cloud mode)
}
```
