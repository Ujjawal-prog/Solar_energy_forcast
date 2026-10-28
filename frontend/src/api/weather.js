import axios from 'axios'

const KEY = import.meta.env.VITE_WEATHER_KEY
const BASE = 'https://api.openweathermap.org/data/2.5'

export const fetchCurrentWeather = (city) =>
  axios.get(`${BASE}/weather`, {
    params: { q: city, appid: KEY, units: 'metric' }
  })

export const fetchForecast = (city) =>
  axios.get(`${BASE}/forecast`, {
    params: { q: city, appid: KEY, units: 'metric' }
  })

export const fetchWeatherByCoords = (lat, lon) =>
  axios.get(`${BASE}/weather`, {
    params: { lat, lon, appid: KEY, units: 'metric' }
  })