# Alcbosh

Personal alcohol unit tracker. React + Vite + Firebase.

- Quick-add tiles for typical drinks (size + ABV pre-set)
- Units auto-calculated on save: `(ml × ABV%) / 1000`
- Weekly cap with progress bar; visual warning approaching daily limit
- History view with weekly heatmaps
- Alcohol-free day streak counter
- Anonymous device pairing via 6-digit code (Firestore sync)

## Run locally

```
npm install
npm run dev
```

## Firebase

Drop your project's web config into [`src/firebase.js`](src/firebase.js). Without it the app falls back to `localStorage` (single-device).

Required Firebase setup:
- Anonymous auth enabled
- Firestore database created
- Rules in `firestore.rules` published

## Stack

Vanilla React (no framework), Tailwind CSS, Firebase Web SDK. Single-page app, no router.
