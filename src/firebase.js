import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'

// === Firebase config — replace with your project's config ===
// 1. Create project at https://console.firebase.google.com
// 2. Enable Anonymous auth (Build → Authentication → Sign-in method)
// 3. Create Firestore database (Build → Firestore Database)
// 4. Project settings → General → Your apps → Web → copy config here
const firebaseConfig = {
  apiKey: 'AIzaSyB_61C5-4ABP7LEHPf9G36UYsjAULmSXOQ',
  authDomain: 'alcbosh-59fc9.firebaseapp.com',
  projectId: 'alcbosh-59fc9',
  storageBucket: 'alcbosh-59fc9.firebasestorage.app',
  messagingSenderId: '1084141316065',
  appId: '1:1084141316065:web:f95672a660e27f87add4a0',
}

export const isConfigured = !firebaseConfig.apiKey.includes('REPLACE_ME')

let app, auth, db
if (isConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { auth, db }

export function signIn() {
  if (!isConfigured) return Promise.resolve(null)
  return signInAnonymously(auth)
}

export function onAuth(cb) {
  if (!isConfigured) return () => {}
  return onAuthStateChanged(auth, cb)
}

// Data lives under users/{dataUid}/drinks. dataUid is the device's own uid
// unless they've paired to another device's uid (stored in localStorage).
export function getDataUid(myUid) {
  return localStorage.getItem('alcbosh:dataUid') || myUid
}

export function setDataUid(uid) {
  localStorage.setItem('alcbosh:dataUid', uid)
}

export function subscribeDrinks(dataUid, cb) {
  if (!isConfigured || !dataUid) return () => {}
  const q = query(
    collection(db, 'users', dataUid, 'drinks'),
    orderBy('at', 'desc'),
  )
  return onSnapshot(q, (snap) => {
    const drinks = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ml: data.ml,
        abv: data.abv,
        units: data.units,
        name: data.name || null,
        freeDay: data.freeDay === true,
        at: data.at?.toDate?.() || new Date(),
      }
    })
    cb(drinks)
  })
}

export async function addDrink(dataUid, drink) {
  if (!isConfigured) return
  const id = crypto.randomUUID()
  await setDoc(doc(db, 'users', dataUid, 'drinks', id), {
    ...drink,
    at: serverTimestamp(),
  })
  return id
}

export async function updateDrink(dataUid, id, patch) {
  if (!isConfigured) return
  const ref = doc(db, 'users', dataUid, 'drinks', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  await setDoc(ref, { ...snap.data(), ...patch }, { merge: true })
}

export async function deleteDrink(dataUid, id) {
  if (!isConfigured) return
  await deleteDoc(doc(db, 'users', dataUid, 'drinks', id))
}

// Pairing: device A writes pairCodes/{code} -> { uid, expiresAt }; device B reads it.
function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function createPairCode(myUid) {
  if (!isConfigured) throw new Error('Firebase not configured')
  const code = randomCode()
  const expiresAt = Timestamp.fromMillis(Date.now() + 5 * 60 * 1000)
  await setDoc(doc(db, 'pairCodes', code), { uid: myUid, expiresAt })
  return code
}

export async function redeemPairCode(code) {
  if (!isConfigured) throw new Error('Firebase not configured')
  const snap = await getDoc(doc(db, 'pairCodes', code))
  if (!snap.exists()) throw new Error('Code not found')
  const { uid, expiresAt } = snap.data()
  if (expiresAt.toMillis() < Date.now()) throw new Error('Code expired')
  await deleteDoc(doc(db, 'pairCodes', code)).catch(() => {})
  return uid
}
