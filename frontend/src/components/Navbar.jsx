import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleDarkMode } from '../store/weatherSlice'

function Navbar() {
  const dispatch = useDispatch()
  const darkMode = useSelector(state => state.weather.darkMode)

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">⛅ SkyCheck</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/favourites">Favourites</Link>
        <Link to="/grid">⚡ Microgrid</Link>
        <button onClick={() => dispatch(toggleDarkMode())} className="theme-btn">
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar