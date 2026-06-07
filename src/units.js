// UK standard unit: 10ml of pure alcohol.
// units = (ml × abv%) / 1000
export function calcUnits(ml, abv) {
  return (ml * abv) / 1000
}

export function fmtUnits(n) {
  return (Math.round(n * 10) / 10).toFixed(1)
}

// Monday-start week. Returns { start, end } as Date objects (local time).
export function weekBounds(d = new Date()) {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  const day = start.getDay() // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return { start, end }
}

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

export function isoDate(d) {
  return startOfDay(d).toISOString().slice(0, 10)
}

// Returns count of consecutive alcohol-free days ending yesterday (or today
// if no drinks today). Excludes today if today already has drinks.
export function afStreak(drinks, today = new Date()) {
  const daysWithDrinks = new Set(drinks.map((d) => isoDate(d.at)))
  const cursor = startOfDay(today)
  if (daysWithDrinks.has(isoDate(cursor))) return 0
  let count = 0
  const c = new Date(cursor)
  while (true) {
    c.setDate(c.getDate() - 1)
    if (daysWithDrinks.has(isoDate(c))) break
    count++
    if (count > 365) break
  }
  return count
}

export const DEFAULT_TILES = [
  { id: 'pot', label: 'Pot', ml: 285, abv: 5.0 },
  { id: 'pint', label: 'Pint', ml: 568, abv: 5.0 },
  { id: 'bottle', label: 'Bottle', ml: 330, abv: 5.0 },
]

export const DEFAULT_SETTINGS = {
  weeklyCap: 10,
  dailyWarn: 2,
  tiles: DEFAULT_TILES,
}

const SETTINGS_KEY = 'alcbosh:settings'

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}
