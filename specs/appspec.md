# Alcbosh — App Spec

Personal alcohol unit tracker. Tuned for the user's typical drinks (Pot 285ml, Pint 568ml, Bottle 330ml, all ~5% ABV). Data syncs across devices via Firebase; falls back to localStorage if Firebase isn't configured.

## Stack

- **React 19** + **Vite 8** (no framework, no router)
- **Tailwind CSS v3**
- **Firebase Web SDK** — Anonymous auth + Firestore
- Hosted on **GitHub Pages** at <https://simon-bristow.github.io/alcbosh/>

## Screens

Single-page app with a top-nav switching between three views:

1. **Today** — week + day progress bars, quick-add tiles, today's drink list, AF-day streak
2. **History** — past weeks grouped, each with a 7-day heatmap
3. **Settings** — limits, tile editor, device-pairing UI

## Core constants

| Thing | Value | Where |
|---|---|---|
| Weekly cap | 10 units | `units.js` `DEFAULT_SETTINGS.weeklyCap` |
| Daily warn | 2 units | `units.js` `DEFAULT_SETTINGS.dailyWarn` |
| Week start | Monday | `units.js` `weekBounds()` |
| Unit formula | `(ml × ABV%) / 1000` | `units.js` `calcUnits()` |
| Default tiles | Pot 285/5, Pint 568/5, Bottle 330/5 | `units.js` `DEFAULT_TILES` |

All defaults are overridable in Settings; user choices persist to localStorage as `alcbosh:settings`.

## State flow

```
initStore() ─┬─► Firebase configured?
             │     yes → signInAnonymously → onAuth(user) → dataUid = localStorage["alcbosh:dataUid"] || user.uid
             │     no  → mode: 'local', dataUid: 'local'
             │
             └─► subscribe(dataUid) ─► drinks list re-renders on every Firestore (or local) change
```

## Files

| Path | Role |
|---|---|
| `src/App.jsx` | Single root component; holds session, drinks, settings, current screen, and modal state |
| `src/units.js` | Units math, week-bounds, AF-streak, settings persistence, defaults |
| `src/store.js` | Storage abstraction — switches between Firestore and localStorage |
| `src/firebase.js` | Firebase init, auth, Firestore CRUD, pairing primitives |
| `src/index.css` | Tailwind directives + dark body background |
| `public/favicon.svg` | Pint glass with green fill |
| `public/manifest.webmanifest` | PWA manifest for home-screen install |
| `.github/workflows/deploy.yml` | Builds + deploys to Pages on every push to `main` |

## Constraints

- **No backend code** — everything client-side; Firestore is the only server-side dependency.
- **No router** — `screen` state in `App.jsx` swaps views.
- **One drink per log** — no batched entries (would complicate the units calc per row).
- **No login UI** — anonymous auth is automatic; pairing is the only user-visible auth action.
- **Pre-1.0** — breaking changes are fine; no migrations.
