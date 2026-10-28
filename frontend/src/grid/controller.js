// Grid rules + helpers. Rules come straight from section 6 of the problem statement.
export const THRESHOLD_KW = 160   // demand above this -> Renewable Storage
export const OVERLOAD_KW = 200    // demand at/above this -> Critical Overload alert
export const PEAK_START = 18      // 18:00-22:00 inclusive -> Renewable Storage
export const PEAK_END = 22

// Battery assumptions (only used when the API does not send battery_soc_pct)
export const BATTERY_KWH = 1000
const START_SOC = 90
const CHARGE_KW = 70              // charging while on Main Grid
const DISCHARGE_SHARE = 0.35      // share of demand the battery covers (rest is solar)
const SOLAR_PERF = 0.8            // panel performance ratio for the outage calculator

export const hourOf = (ts) => {
  const m = /(\d{1,2}):\d{2}/.exec(String(ts))
  return m ? Number(m[1]) : 0
}
export const fmtHour = (h) => `${String(h).padStart(2, '0')}:00`

export function decideMode(demand, hour) {
  const renewable = demand > THRESHOLD_KW || (hour >= PEAK_START && hour <= PEAK_END)
  return {
    grid_mode: renewable ? 'RENEWABLE_STORAGE' : 'MAIN_GRID',
    overload: demand >= OVERLOAD_KW,
  }
}

export function simulateSoc(items) {
  let soc = START_SOC
  return items.map((it) => {
    const delta = it.grid_mode === 'RENEWABLE_STORAGE'
      ? -((it.demand * DISCHARGE_SHARE) / BATTERY_KWH) * 100
      : (CHARGE_KW / BATTERY_KWH) * 100
    soc = Math.min(100, Math.max(0, soc + delta))
    return Math.round(soc * 10) / 10
  })
}

// Accepts the API response ({forecast:[...]} or a plain array) and returns what the UI needs.
export function normalizeForecast(raw, inputRows) {
  const list = Array.isArray(raw) ? raw : raw?.forecast
  if (!Array.isArray(list) || list.length === 0) throw new Error('Forecast response had no rows')
  const items = list.map((it, i) => {
    const input = inputRows?.[i] ?? {}
    const demand = Number(it.predicted_demand_kw ?? it.target_demand_kw ?? it.demand_kw)
    if (!Number.isFinite(demand)) throw new Error(`Row ${i + 1} has no predicted demand`)
    const timestamp = it.timestamp ?? input.timestamp
    const hour = hourOf(timestamp)
    const rules = decideMode(demand, hour)
    return {
      timestamp, hour, label: fmtHour(hour), demand,
      temp: it.ambient_temp_c ?? input.ambient_temp_c,
      humidity: it.humidity_pct ?? input.humidity_pct,
      irradiance: it.solar_irradiance_wm2 ?? input.solar_irradiance_wm2 ?? 0,
      grid_mode: it.grid_mode ?? rules.grid_mode,
      overload: it.overload ?? rules.overload,
      soc: it.battery_soc_pct,
    }
  })
  if (items.some((it) => typeof it.soc !== 'number')) {
    const sim = simulateSoc(items)
    items.forEach((it, i) => { it.soc = sim[i] })
  }
  return { items, capacityKwh: raw?.battery_capacity_kwh ?? BATTERY_KWH }
}

// Battery energy needed to ride through an outage (wraps past midnight).
export function outageKwh(items, startHour, hours, panelKw) {
  let total = 0
  for (let i = 0; i < hours; i++) {
    const it = items.find((x) => x.hour === (startHour + i) % 24)
    if (!it) continue
    const solar = panelKw * (it.irradiance / 1000) * SOLAR_PERF
    total += Math.max(0, it.demand - solar)
  }
  return Math.round(total * 10) / 10
}

// ---- Demo data + stand-in model (used until Person 2's QuickML endpoint is connected) ----
export function sampleDay(date = new Date().toISOString().slice(0, 10)) {
  return Array.from({ length: 24 }, (_, h) => {
    const wave = Math.sin(((h - 9) / 24) * 2 * Math.PI)
    return {
      timestamp: `${date} ${fmtHour(h)}:00`,
      ambient_temp_c: Math.round((33 + 7 * wave) * 10) / 10,
      humidity_pct: Math.round(55 - 15 * wave),
      solar_irradiance_wm2: h >= 6 && h <= 18 ? Math.round(900 * Math.sin(((h - 6) / 12) * Math.PI)) : 0,
    }
  })
}

export function mockPredict(rows) {
  return rows.map((r) => {
    const h = hourOf(r.timestamp)
    const base = 95 + 18 * Math.exp(-((h - 9) ** 2) / 8) + 35 * Math.exp(-((h - 15) ** 2) / 10) + 50 * Math.exp(-((h - 20) ** 2) / 6)
    const d = base + 4.5 * Math.max(0, r.ambient_temp_c - 22) + 0.25 * Math.max(0, r.humidity_pct - 55) - 0.03 * r.solar_irradiance_wm2
    return { timestamp: r.timestamp, predicted_demand_kw: Math.round(d * 100) / 100 }
  })
}

// ---- CSV parsing + cleaning ----
export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row')
  const head = lines[0].split(',').map((s) => s.trim().toLowerCase())
  return lines.slice(1).map((l) => {
    const c = l.split(',')
    return Object.fromEntries(head.map((h, i) => [h, (c[i] ?? '').trim()]))
  })
}

const FIELDS = [
  { key: 'ambient_temp_c', min: -40, max: 60 },
  { key: 'humidity_pct', min: 0, max: 100 },
  { key: 'solar_irradiance_wm2', min: 0, max: 1400 },
]

export function cleanRows(raw) {
  const warnings = []
  const missing = FIELDS.filter((f) => !raw.some((r) => f.key in r)).map((f) => f.key)
  if (missing.length) throw new Error(`Missing column(s): ${missing.join(', ')}`)

  let rows = raw.map((r) => ({ ...r }))
  if (rows.every((r) => r.timestamp)) rows.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
  if (rows.length > 24) {
    warnings.push(`Got ${rows.length} rows, using the first 24 hours.`)
    rows = rows.slice(0, 24)
  }
  if (rows.length < 24) throw new Error(`Need 24 hourly rows, got ${rows.length}.`)

  const date = new Date().toISOString().slice(0, 10)
  FIELDS.forEach(({ key, min, max }) => {
    const vals = rows.map((r) => {
      const v = r[key] === '' || r[key] == null ? NaN : Number(r[key])
      return Number.isFinite(v) && v >= min && v <= max ? v : null
    })
    const good = vals.filter((v) => v !== null)
    if (good.length === 0) throw new Error(`Column ${key} has no valid values.`)
    const mean = good.reduce((a, b) => a + b, 0) / good.length
    let bad = 0, last = null
    vals.forEach((v, i) => {
      let out = v
      if (out === null) { bad++; out = last ?? mean }
      last = out
      rows[i][key] = Math.round(out * 10) / 10
    })
    if (bad) warnings.push(`${bad} missing/invalid value(s) in ${key} were filled.`)
  })
  rows.forEach((r, i) => { if (!r.timestamp) r.timestamp = `${date} ${fmtHour(i)}:00` })
  return { rows: rows.map((r) => ({
    timestamp: r.timestamp, ambient_temp_c: r.ambient_temp_c,
    humidity_pct: r.humidity_pct, solar_irradiance_wm2: r.solar_irradiance_wm2,
  })), warnings }
}
