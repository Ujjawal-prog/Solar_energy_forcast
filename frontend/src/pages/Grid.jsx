import { useState } from 'react'
import fakeForecast from '../grid/fakeForecast.json'
import { normalizeForecast, sampleDay, parseCsv, cleanRows, fmtHour, PEAK_START, PEAK_END } from '../grid/controller'
import { getForecast, gridSource } from '../api/grid'
import AlertBanner from '../components/grid/AlertBanner'
import InputPanel from '../components/grid/InputPanel'
import LoadCurve from '../components/grid/LoadCurve'
import HourlyTimeline from '../components/grid/HourlyTimeline'
import BatteryGauge from '../components/grid/BatteryGauge'
import OutagePanel from '../components/grid/OutagePanel'

const SOURCE_LABEL = { sample: 'Sample data', mock: 'Stand-in model', api: 'Live QuickML' }

function Grid() {
  const [rows, setRows] = useState(() => sampleDay())
  const [result, setResult] = useState(() => ({ source: 'sample', ...normalizeForecast(fakeForecast) }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [warnings, setWarnings] = useState([])
  const [selected, setSelected] = useState(0)
  const [perFlat, setPerFlat] = useState(false)
  const [flats, setFlats] = useState(120)

  const { items, capacityKwh } = result
  const scale = perFlat ? 1 / flats : 1
  const unitLabel = perFlat ? `per flat, ${flats} flats` : 'whole colony'
  const peak = items.reduce((a, b) => (b.demand > a.demand ? b : a))

  const run = async (inputRows) => {
    setBusy(true)
    setError('')
    try {
      const { rows: clean, warnings: warn } = cleanRows(inputRows)
      setRows(clean)
      setWarnings(warn)
      const data = await getForecast(clean)
      setResult({ source: gridSource, ...normalizeForecast(data, clean) })
      setSelected(0)
    } catch (e) {
      setError(e.response ? `Forecast API error (${e.response.status}). Check the endpoint.` : e.message)
    } finally {
      setBusy(false)
    }
  }

  const loadCsv = async (file) => {
    try {
      await run(parseCsv(await file.text()))
    } catch (e) {
      setError(e.message)
    }
  }

  const loadSample = () => {
    setRows(sampleDay())
    setWarnings([])
    setError('')
  }

  return (
    <div className="page grid-page">
      <AlertBanner items={items} />
      <div className="grid-head">
        <h2 className="page-title">⚡ Microgrid Dashboard</h2>
        <span className={`grid-source ${result.source}`}>{SOURCE_LABEL[result.source]}</span>
      </div>

      <InputPanel rows={rows} setRows={setRows} busy={busy} onRun={() => run(rows)} onSample={loadSample} onCsv={loadCsv} />
      {error && <p className="error" role="alert">{error}</p>}
      {warnings.length > 0 && (
        <ul className="grid-warnings">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
      )}

      <div className="grid-view">
        <div className="grid-toggle" role="group" aria-label="View">
          <button className={!perFlat ? 'on' : ''} onClick={() => setPerFlat(false)}>Colony</button>
          <button className={perFlat ? 'on' : ''} onClick={() => setPerFlat(true)}>Per flat</button>
        </div>
        {perFlat && (
          <label className="grid-flats">Number of flats
            <input type="number" min="1" max="5000" value={flats}
              onChange={(e) => setFlats(Math.max(1, Number(e.target.value) || 1))} />
          </label>
        )}
      </div>

      <div className="grid-layout">
        <div className="grid-wide"><LoadCurve items={items} scale={scale} unitLabel={unitLabel} /></div>
        <div className="grid-wide">
          <HourlyTimeline items={items} scale={scale} selected={selected} onSelect={setSelected} />
        </div>
        <BatteryGauge items={items} selected={selected} />
        <OutagePanel items={items} flats={flats} perFlat={perFlat} capacityKwh={capacityKwh} />
        <div className="chart-container grid-wide">
          <h3>💡 Quick tips</h3>
          <ul className="grid-tips">
            <li>Demand peaks at {peak.label}. Run heavy appliances like geysers and washing machines before then.</li>
            <li>Between {fmtHour(PEAK_START)} and {fmtHour(PEAK_END)} the colony runs on battery, so cut non-essential load in that window.</li>
            <li>Set ACs to 24 to 26°C. Each degree lower adds noticeably to hot-hour demand.</li>
            <li>Keep the battery charged on Main Grid hours so it is full before the evening window.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Grid
