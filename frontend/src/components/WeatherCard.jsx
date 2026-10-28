import { useDispatch, useSelector } from 'react-redux'
import { addFavourite, removeFavourite } from '../store/weatherSlice'
import { useNavigate } from 'react-router-dom'

function WeatherCard({ data }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const favourites = useSelector(state => state.weather.favourites)
  const isFavourite = favourites.includes(data.name)

  const getWeatherEmoji = (main) => {
    const map = {
      Clear: '☀️', Clouds: '☁️', Rain: '🌧️',
      Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️',
      Mist: '🌫️', Fog: '🌫️', Haze: '🌫️'
    }
    return map[main] || '🌡️'
  }

  return (
    <div className="weather-card">
      <div className="weather-card-header">
        <h2>{data.name}, {data.sys.country}</h2>
        <span className="weather-emoji">{getWeatherEmoji(data.weather[0].main)}</span>
      </div>

      <div className="weather-temp">{Math.round(data.main.temp)}°C</div>
      <p className="weather-desc">{data.weather[0].description}</p>

      <div className="weather-stats">
        <div className="stat">
          <span>💧 Humidity</span>
          <strong>{data.main.humidity}%</strong>
        </div>
        <div className="stat">
          <span>💨 Wind</span>
          <strong>{data.wind.speed} m/s</strong>
        </div>
        <div className="stat">
          <span>🌡️ Feels Like</span>
          <strong>{Math.round(data.main.feels_like)}°C</strong>
        </div>
        <div className="stat">
          <span>👁️ Visibility</span>
          <strong>{(data.visibility / 1000).toFixed(1)} km</strong>
        </div>
      </div>

      <div className="weather-card-actions">
        <button
          className={isFavourite ? 'btn-remove' : 'btn-add'}
          onClick={() => isFavourite ? dispatch(removeFavourite(data.name)) : dispatch(addFavourite(data.name))}
        >
          {isFavourite ? '❌ Remove' : '❤️ Save City'}
        </button>
        <button className="btn-forecast" onClick={() => navigate(`/forecast/${data.name}`)}>
          📅 5-Day Forecast
        </button>
      </div>
    </div>
  )
}

export default WeatherCard