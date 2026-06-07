// Storage abstraction: uses Firestore when configured, localStorage otherwise.
// This lets the app run end-to-end before Firebase is wired up.
import {
  isConfigured,
  signIn,
  onAuth,
  getDataUid,
  setDataUid,
  subscribeDrinks,
  addDrink,
  updateDrink,
  deleteDrink,
  createPairCode,
  redeemPairCode,
} from './firebase'

const LOCAL_KEY = 'alcbosh:drinks'

function localList() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]').map((d) => ({
      ...d,
      at: new Date(d.at),
    }))
  } catch {
    return []
  }
}

function localSave(drinks) {
  localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify(drinks.map((d) => ({ ...d, at: d.at.toISOString() }))),
  )
}

const localSubs = new Set()
function notifyLocal() {
  const drinks = localList().sort((a, b) => b.at - a.at)
  localSubs.forEach((cb) => cb(drinks))
}

export function initStore(onReady) {
  if (!isConfigured) {
    onReady({ uid: 'local', dataUid: 'local', mode: 'local' })
    return () => {}
  }
  const unsub = onAuth((user) => {
    if (user) {
      onReady({ uid: user.uid, dataUid: getDataUid(user.uid), mode: 'cloud' })
    }
  })
  signIn().catch((e) => console.error('signIn failed', e))
  return unsub
}

export function subscribe(dataUid, cb) {
  if (!isConfigured) {
    localSubs.add(cb)
    notifyLocal()
    return () => localSubs.delete(cb)
  }
  return subscribeDrinks(dataUid, cb)
}

export async function add(dataUid, drink) {
  if (!isConfigured) {
    const drinks = localList()
    drinks.push({ id: crypto.randomUUID(), at: new Date(), ...drink })
    localSave(drinks)
    notifyLocal()
    return
  }
  await addDrink(dataUid, drink)
}

export async function update(dataUid, id, patch) {
  if (!isConfigured) {
    const drinks = localList().map((d) => (d.id === id ? { ...d, ...patch } : d))
    localSave(drinks)
    notifyLocal()
    return
  }
  await updateDrink(dataUid, id, patch)
}

export async function remove(dataUid, id) {
  if (!isConfigured) {
    localSave(localList().filter((d) => d.id !== id))
    notifyLocal()
    return
  }
  await deleteDrink(dataUid, id)
}

export async function startPair(myUid) {
  return createPairCode(myUid)
}

export async function completePair(code) {
  const uid = await redeemPairCode(code)
  setDataUid(uid)
  return uid
}

export { isConfigured }
