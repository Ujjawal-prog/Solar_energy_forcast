import { useRef } from 'react'
import { hourOf } from '../../grid/controller'

const COLS = [
  ['ambient_temp_c', 'Temp (°C)'],
  ['humidity_pct', 'Humidity (%)'],
  ['solar_irradiance_wm2', 'Irradiance (W/m²)'],
]

function InputPanel({ rows, setRows, onRun, onSample, onCsv, busy }) {
  const fileRef = useRef(null)
  const edit = (i, key, value) => setRows(rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))

  return (
    <div className="chart-container">
      <h3>⚙️ Weather inputs</h3>
      <div className="grid-actions">
        <button className="btn-forecast" onClick={onSample}>Load sample day</button>
        <button className="btn-forecast" onClick={() => fileRef.current?.click()}>Upload CSV</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden
          onChange={(e) => { if (e.target.files[0]) onCsv(e.target.files[0]); e.target.value = '' }} />
        <button className="btn-search" onClick={onRun} disabled={busy}>{busy ? 'Forecasting...' : 'Run forecast'}</button>
      </div>
      <div className="grid-table-wrap">
        <table className="grid-table">
          <thead>
            <tr><th>Hour</th>{COLS.map(([k, label]) => <th key={k}>{label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{String(hourOf(r.timestamp)).padStart(2, '0')}:00</td>
                {COLS.map(([k, label]) => (
                  <td key={k}>
                    <input type="number" step="any" aria-label={`${label} at hour ${hourOf(r.timestamp)}`}
                      value={r[k]} onChange={(e) => edit(i, k, e.target.value)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="grid-note">CSV columns: timestamp (optional), ambient_temp_c, humidity_pct, solar_irradiance_wm2. Empty cells are filled automatically.</p>
    </div>
  )
}

export default InputPanel
