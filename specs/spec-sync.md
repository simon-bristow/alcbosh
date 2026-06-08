# Spec — Sync (Firebase + device pairing)

Covers data model, auth flow, pairing, and the local-storage fallback when Firebase is unconfigured.

## Two modes

`firebase.js` exports `isConfigured` based on whether the placeholder `REPLACE_ME` is still in `firebaseConfig.apiKey`.

| Mode | Trigger | Storage | Multi-device |
|---|---|---|---|
| `local` | Firebase config still has `REPLACE_ME` | `localStorage["alcbosh:drinks"]` | No (per-browser) |
| `cloud` | Real Firebase config in place | Firestore `users/{dataUid}/drinks/*` | Yes (via pairing) |

`store.js` is the abstraction layer — every consumer calls `add/update/remove/subscribe(dataUid, …)` regardless of mode.

## Auth (cloud mode)

1. App mount → `initStore(onReady)` → `signInAnonymously()`
2. `onAuthStateChanged` fires with `user` → `onReady({ uid, dataUid, mode: 'cloud' })`
3. `dataUid = localStorage["alcbosh:dataUid"] || user.uid`
4. Subscriptions and writes use `dataUid`, not `uid` — so a paired device reads/writes the *primary* device's data

Anonymous uids are persistent per Firebase Web SDK install — clearing site data resets the uid. This is acceptable because real user data lives under the *paired* uid (stored in localStorage).

## Firestore data model

```
users/{dataUid}/drinks/{drinkId}
  ml: number
  abv: number
  units: number
  name: string|null
  at: serverTimestamp

pairCodes/{6-digit-code}
  uid: string         // the device generating the code
  expiresAt: Timestamp (now + 5 min)
```

`drinks` are queried ordered by `at` desc.

## Pairing flow

```
Device A                          Device B
─────────────                     ─────────────
signInAnonymously → uidA          signInAnonymously → uidB
createPairCode(uidA)
  → writes pairCodes/123456 = { uid: uidA, expiresAt: +5min }
  → shows "123456" to user

                                  user types "123456"
                                  redeemPairCode("123456")
                                    → reads pairCodes/123456
                                    → validates expiresAt
                                    → deletes pairCodes/123456
                                    → returns uidA
                                  setDataUid(uidA) → localStorage
                                  location.reload()

Both devices now read/write users/{uidA}/drinks/*
```

Code is 6 random digits (`Math.floor(100000 + Math.random() * 900000)`). Single-use (deleted on redeem). Expires after 5 minutes.

## Firestore security rules

Published in `firestore.rules` and pasted into the Firebase console. Summary:

- Any signed-in user can read/write any `users/{userId}/drinks/{drinkId}`
- Any signed-in user can read/delete any `pairCodes/{code}`
- Any signed-in user can create `pairCodes/{code}` only if `request.resource.data.uid == request.auth.uid` (can't impersonate another device)

The "any signed-in user can read any drinks doc" rule is intentionally permissive — anonymous uids are 28-char random strings, undiscoverable without a pair code. Acceptable for a personal tracker; would need tightening (member arrays) for shared use.

## Local fallback

`localStorage["alcbosh:drinks"]` stores the JSON array. `store.js` maintains a `Set` of subscribers and re-broadcasts on every write so the React subscription pattern is identical between modes.

No migration is performed when moving from local to cloud — drinks logged in local mode stay in localStorage; cloud mode starts empty.
