import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function ForecastChart({ data }) {
  const chartData = data.list.slice(0, 8).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(item.main.temp),
    humidity: item.main.humidity,
  }))

  return (
    <div className="chart-container">
      <h3>🌡️ Temperature Today</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#aaa' }} />
          <YAxis tick={{ fontSize: 12, fill: '#aaa' }} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ForecastChart