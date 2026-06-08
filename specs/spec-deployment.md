# Spec — Deployment

## Hosting

GitHub Pages, repo `simon-bristow/alcbosh`, served at:

**<https://simon-bristow.github.io/alcbosh/>**

## Vite base path

`vite.config.js` sets `base: '/alcbosh/'`. This makes Vite emit asset URLs as `/alcbosh/assets/...` so they resolve correctly under the GH Pages subpath.

References inside `index.html` use **bare absolute paths** (`/favicon.svg`, `/manifest.webmanifest`) — Vite injects the base prefix automatically. Do NOT prefix them with `/alcbosh/` manually or you'll get `/alcbosh/alcbosh/favicon.svg`.

Anything fetched from JS that needs to honor the base prefix should use `import.meta.env.BASE_URL`.

## CI workflow

`.github/workflows/deploy.yml` triggers on every push to `main`. Two jobs:

1. **build**: checkout → `actions/setup-node@v4` with node 20 + npm cache → `npm ci` → `npm run build` → `actions/upload-pages-artifact@v3` with `path: dist`
2. **deploy**: `actions/deploy-pages@v4` against the `github-pages` environment

Concurrency group `pages` with `cancel-in-progress: true` prevents overlapping deploys.

## Pages settings

In `Settings → Pages` on GitHub:
- **Source**: GitHub Actions (not "Deploy from a branch")
- Custom domain: none

## PWA manifest

`public/manifest.webmanifest`:
- `start_url` and `scope` are `/alcbosh/` (matches the subpath)
- `display: standalone` — runs without browser chrome when installed
- Theme/background colors match the app's `#0b0d12` body background
- Icons reference `favicon.svg` and `apple-touch-icon.svg`

`index.html` adds Apple-specific meta tags so iOS "Add to Home Screen" produces a fullscreen dark-status-bar launch.

## Local dev

```
npm install
npm run dev   # serves at http://localhost:5174/alcbosh/ (with the launch.json config) or 5173/alcbosh/ default
```

## PAT scope gotcha

The user's personal access token does **not** have the `workflow` scope. Pushing changes to `.github/workflows/*` will be rejected. Workflow files must be edited via the GitHub web UI (or the token's scopes extended). Source-only commits push fine.

## Firebase config in source

Firebase web API keys are designed to be public — they're embedded in client JS regardless. Committing `firebaseConfig` to a public repo is safe; security comes from Firestore rules + Anonymous auth, not from hiding the key.

If you wanted to lock the key down further, restrict it to specific HTTP referrers in Google Cloud Console (e.g. `simon-bristow.github.io/*` and `localhost:*`).
