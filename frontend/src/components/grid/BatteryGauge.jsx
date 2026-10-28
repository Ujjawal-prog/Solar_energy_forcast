import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'

function BatteryGauge({ items, selected }) {
  const cur = items[selected]
  const low = items.reduce((a, b) => (b.soc < a.soc ? b : a))
  const tone = cur.soc > 50 ? 'ok' : cur.soc > 25 ? 'mid' : 'low'
  return (
    <div className="chart-container">
      <h3>🔋 Battery state of charge</h3>
      <p className="grid-big">{cur.soc.toFixed(1)}% <small>at {cur.label}</small></p>
      <div className="grid-bar" role="progressbar" aria-valuenow={cur.soc} aria-valuemin={0} aria-valuemax={100} aria-label="Battery state of charge">
        <div className={`grid-bar-fill ${tone}`} style={{ width: `${cur.soc}%` }} />
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#aaa' }} interval={5} />
          <YAxis domain={[0, 100]} hide />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '8px' }} formatter={(v) => [`${v}%`, 'Charge']} />
          <Area type="monotone" dataKey="soc" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} />
          <ReferenceDot x={cur.label} y={cur.soc} r={5} fill="#38bdf8" stroke="none" />
        </AreaChart>
      </ResponsiveContainer>
      <p className="grid-note">Lowest point of the day: {low.soc.toFixed(1)}% at {low.label}.</p>
    </div>
  )
}

export default BatteryGauge
