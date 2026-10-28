import { useState } from 'react'
import { outageKwh } from '../../grid/controller'

function OutagePanel({ items, flats, perFlat, capacityKwh }) {
  const [start, setStart] = useState(19)
  const [hours, setHours] = useState(4)
  const [panelKw, setPanelKw] = useState(50)

  const num = (v, lo, hi) => Math.min(hi, Math.max(lo, Number(v) || 0))
  const needed = outageKwh(items, start, hours, panelKw)
  const shown = perFlat ? needed / flats : needed
  const short = needed - capacityKwh

  return (
    <div className="chart-container">
      <h3>🔌 Outage planner</h3>
      <div className="grid-fields">
        <label>Starts at (hour)
          <input type="number" min="0" max="23" value={start} onChange={(e) => setStart(num(e.target.value, 0, 23))} />
        </label>
        <label>Lasts (hours)
          <input type="number" min="1" max="24" value={hours} onChange={(e) => setHours(num(e.target.value, 1, 24))} />
        </label>
        <label>Solar panels (kW)
          <input type="number" min="0" max="2000" value={panelKw} onChange={(e) => setPanelKw(num(e.target.value, 0, 2000))} />
        </label>
      </div>
      <p className="grid-big">{shown.toFixed(1)} kWh <small>battery needed{perFlat ? ' per flat' : ''}</small></p>
      <p className={short > 0 ? 'grid-warn' : 'grid-good'}>
        {short > 0
          ? `Installed battery (${capacityKwh} kWh) falls short by ${short.toFixed(1)} kWh. Add storage or panels.`
          : `Installed battery (${capacityKwh} kWh) covers this outage.`}
      </p>
    </div>
  )
}

export default OutagePanel
