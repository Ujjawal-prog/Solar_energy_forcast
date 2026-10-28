import { useSelector, useDispatch } from 'react-redux'
import { removeFavourite } from '../store/weatherSlice'
import { useState } from 'react'
import { fetchCurrentWeather } from '../api/weather'
import { useNavigate } from 'react-router-dom'

function Favourites() {
  const favourites = useSelector(state => state.weather.favourites)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [weatherData, setWeatherData] = useState({})

  useState(() => {
    favourites.forEach(city => {
      fetchCurrentWeather(city).then(res => {
        setWeatherData(prev => ({ ...prev, [city]: res.data }))
      })
    })
  }, [favourites])

  return (
    <div className="page">
      <h2 className="page-title">❤️ Favourite Cities</h2>
      {favourites.length === 0 ? (
        <p className="loading">No favourite cities yet. Search and save some! ⛅</p>
      ) : (
        <div className="favourites-grid">
          {favourites.map(city => {
            const data = weatherData[city]
            return (
              <div key={city} className="favourite-card" onClick={() => navigate(`/forecast/${city}`)}>
                <h3>{city}</h3>
                {data ? (
                  <>
                    <p className="fav-temp">{Math.round(data.main.temp)}°C</p>
                    <p className="fav-desc">{data.weather[0].description}</p>
                  </>
                ) : (
                  <p>Loading...</p>
                )}
                <button
                  className="btn-remove"
                  onClick={(e) => { e.stopPropagation(); dispatch(removeFavourite(city)) }}
                >
                  ❌ Remove
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Favourites