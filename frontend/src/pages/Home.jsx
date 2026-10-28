import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentWeather, fetchForecast, fetchWeatherByCoords } from '../api/weather'
import { addRecentSearch } from '../store/weatherSlice'
import WeatherCard from '../components/WeatherCard'
import ForecastChart from '../components/ForecastChart'

function Home() {
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const recentSearches = useSelector(state => state.weather.recentSearches)

  // Get user's current location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords
        fetchWeatherByCoords(latitude, longitude)
          .then(res => setWeather(res.data))
          .catch(() => {})
      })
    }
  }, [])

  const handleSearch = (city) => {
    if (!city.trim()) return
    setLoading(true)
    setError('')

    Promise.all([
      fetchCurrentWeather(city),
      fetchForecast(city)
    ]).then(([weatherRes, forecastRes]) => {
      setWeather(weatherRes.data)
      setForecast(forecastRes.data)
      dispatch(addRecentSearch(city))
      setLoading(false)
    }).catch(() => {
      setError('City not found! Please try again.')
      setLoading(false)
    })
  }

  return (
    <div className="page">
      <div className="home-hero">
        <h1>⛅ Check the Weather</h1>
        <p>Search any city around the world</p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search city... (e.g. Mumbai, London)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
            className="search-input"
          />
          <button onClick={() => handleSearch(query)} className="btn-search">Search</button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <span>Recent: </span>
            {recentSearches.map(city => (
              <button key={city} onClick={() => handleSearch(city)} className="recent-tag">
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <p className="loading">Loading weather data...</p>}
      {error && <p className="error">{error}</p>}

      {weather && !loading && (
        <div className="weather-content">
          <WeatherCard data={weather} />
          {forecast && <ForecastChart data={forecast} />}
        </div>
      )}
    </div>
  )
}

export default Home