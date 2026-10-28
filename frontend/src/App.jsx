import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { useSelector } from 'react-redux'
import store from './store/store'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Forecast from './pages/Forecast'
import Favourites from './pages/Favourites'
import Grid from './pages/Grid'
import './index.css'

function AppContent() {
  const darkMode = useSelector(state => state.weather.darkMode)

  return (
    <div className={darkMode ? 'app dark' : 'app light'}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forecast/:city" element={<Forecast />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/grid" element={<Grid />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  )
}

export default App