# Spec — Settings

Three configurable sections. All values persist to `localStorage["alcbosh:settings"]` via `saveSettings()`. Persistence is **per-device** — settings do not sync across paired devices.

## 1. Limits

| Field | Default | Effect |
|---|---|---|
| Weekly cap (units) | 10 | Drives the week progress bar's denominator and color thresholds |
| Daily warn at (units) | 2 | Drives the daily progress bar's denominator, warn message, and heatmap red threshold |

Both are number inputs with `step="0.1"`.

## 2. Quick-add tiles

Three rows, one per tile, with three inline inputs each: **label · ml · ABV%**. Editing any field updates the tile's behavior immediately (next quick-add uses new values) and persists.

The number of tiles is fixed at 3 — there is no add/remove tile UI. Tile IDs (`pot`, `pint`, `bottle`) are stable; renaming the label does not change the ID.

## 3. Sync

Depends on `isConfigured` from `firebase.js`:

### Not configured

Shows: *"Add Firebase config in `src/firebase.js` to enable cloud sync."* No interactive controls.

### Configured

- **Mode + uid**: shows `cloud · uid: <first 8 chars>…` for debugging
- **Generate pair code** button: creates a 6-digit code under `pairCodes/{code}` valid for 5 minutes, displays it in big mono font
- **Enter code from other device** input + **Pair** button: redeems a code → stores the source device's uid as `localStorage["alcbosh:dataUid"]` → reloads the page so subscriptions re-bind

Status messages (errors, "Paired — reloading…") render below the pair input.

## Implementation notes

- Settings are loaded synchronously at `App.jsx` mount via `useState(loadSettings())`.
- Every change calls `onChange(newSettings)` → `setSettings + saveSettings`. There's no debounce; localStorage writes are cheap.
- Pair-code redemption deletes the code doc on success (single-use).
