import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceArea } from 'recharts'
import { THRESHOLD_KW, OVERLOAD_KW, PEAK_START, PEAK_END, fmtHour } from '../../grid/controller'

function LoadCurve({ items, scale, unitLabel }) {
  const data = items.map((i) => ({ label: i.label, demand: Math.round(i.demand * scale * 10) / 10 }))
  return (
    <div className="chart-container">
      <h3>📈 Predicted load, next 24 hours ({unitLabel})</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#aaa' }} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: '#aaa' }} unit=" kW" width={64}
            domain={[0, (max) => Math.ceil(Math.max(max, OVERLOAD_KW * 1.1 * scale))]} />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} formatter={(v) => [`${v} kW`, 'Demand']} />
          <ReferenceArea x1={fmtHour(PEAK_START)} x2={fmtHour(PEAK_END)} fill="#f59e0b" fillOpacity={0.12} />
          <ReferenceLine y={THRESHOLD_KW * scale} stroke="#f59e0b" strokeDasharray="6 4" label={{ value: 'Storage threshold', fill: '#f59e0b', fontSize: 11, position: 'insideTopLeft' }} />
          <ReferenceLine y={OVERLOAD_KW * scale} stroke="#ef4444" strokeDasharray="6 4" label={{ value: 'Overload', fill: '#ef4444', fontSize: 11, position: 'insideTopLeft' }} />
          <Line type="monotone" dataKey="demand" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="grid-note">Shaded band = 18:00 to 22:00 evening window (always on battery).</p>
    </div>
  )
}

export default LoadCurve
