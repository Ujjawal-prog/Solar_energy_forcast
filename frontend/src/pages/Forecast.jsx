import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchForecast } from '../api/weather'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function Forecast() {
  const { city } = useParams()
  const [forecast, setForecast] = useState(null)

  useEffect(() => {
    fetchForecast(city).then(res => setForecast(res.data))
  }, [city])

  if (!forecast) return <p className="loading">Loading forecast...</p>

  // Group by day
  const daily = {}
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    if (!daily[date]) daily[date] = []
    daily[date].push(item)
  })

  const chartData = Object.entries(daily).map(([date, items]) => ({
    date,
    maxTemp: Math.round(Math.max(...items.map(i => i.main.temp_max))),
    minTemp: Math.round(Math.min(...items.map(i => i.main.temp_min))),
    humidity: Math.round(items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length),
  }))

  return (
    <div className="page">
      <h2 className="page-title">📅 5-Day Forecast — {city}</h2>

      {/* Forecast Cards */}
      <div className="forecast-grid">
        {Object.entries(daily).map(([date, items]) => {
          const avg = Math.round(items.reduce((sum, i) => sum + i.main.temp, 0) / items.length)
          const desc = items[0].weather[0].description
          return (
            <div key={date} className="forecast-card">
              <p className="forecast-date">{date}</p>
              <p className="forecast-temp">{avg}°C</p>
              <p className="forecast-desc">{desc}</p>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="chart-container">
        <h3>🌡️ Temperature Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#aaa' }} />
            <YAxis tick={{ fontSize: 11, fill: '#aaa' }} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="maxTemp" stroke="#f87171" strokeWidth={2} name="Max Temp" dot={false} />
            <Line type="monotone" dataKey="minTemp" stroke="#38bdf8" strokeWidth={2} name="Min Temp" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Forecast