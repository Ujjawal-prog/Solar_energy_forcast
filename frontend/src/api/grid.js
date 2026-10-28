import axios from 'axios'
import { mockPredict } from '../grid/controller'

// Set VITE_GRID_API_URL in .env once Person 2's endpoint is live.
// Request:  POST { rows: [{ timestamp, ambient_temp_c, humidity_pct, solar_irradiance_wm2 } x24] }
// Response: { forecast: [{ timestamp, predicted_demand_kw, ... }] } (or a plain array)
const URL = import.meta.env.VITE_GRID_API_URL

export const gridSource = URL ? 'api' : 'mock'

export async function getForecast(rows) {
  if (!URL) return mockPredict(rows)
  const res = await axios.post(URL, { rows }, { timeout: 20000 })
  return res.data
}
