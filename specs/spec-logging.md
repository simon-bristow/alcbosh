# Spec — Logging drinks

Covers quick-add tiles, custom-drink modal, units calculation, and edit/delete of existing entries.

## Quick-add tiles

Three tiles rendered on the Today screen. Each is a single tap → one drink logged with the tile's `ml` + `abv` defaults and `name = tile.label`.

Defaults (from `units.js` `DEFAULT_TILES`):

| Label | ml | ABV | Computed units |
|---|---|---|---|
| Pot | 285 | 5.0 | 1.4 |
| Pint | 568 | 5.0 | 2.8 |
| Bottle | 330 | 5.0 | 1.7 |

Tile renders show: label, `ml · ABV%`, and the precomputed unit value as `+X.Xu`. Tiles are editable in Settings — label, ml, and ABV can all be changed; new defaults persist to localStorage.

## Custom drink

Triggered by the "+ Custom drink" button below the tiles. Opens a modal with:

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

- `name · ml · ABV%`
- `HH:MM · X.Xu`
- **Edit** button → opens DrinkModal pre-filled with current values
- **Delete** button → immediately removes (no confirmation)

Empty state: `Nothing logged yet.` or `N alcohol-free days so far.` if streak > 0.

## Edit flow

Edit reuses `DrinkModal` with `initial={drink}`. On save, calls `update(dataUid, id, { name, ml, abv, units })` — `units` always recomputed from the new ml/abv.

## Delete flow

No confirmation. Optimistic UI via Firestore (or localStorage) subscription — the list updates as soon as the backend acknowledges.

## Data shape

```js
{
  id: string,        // UUID
  name: string|null, // null for quick-adds saved with no custom label (legacy); tiles always set name
  ml: number,
  abv: number,
  units: number,     // denormalised; recomputed on every write
  at: Date           // logged-at time (serverTimestamp in cloud mode, client Date in local mode)
}
```
