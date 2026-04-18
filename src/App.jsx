import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Simulador from './pages/Simulador'
import Dashboard from './pages/Dashboard'
import Calendario from './pages/Calendario'
import InstallPWA from './components/InstallPWA'
import UpdateBanner from './components/UpdateBanner'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <UpdateBanner />
      <Routes>
        <Route path="/" element={<Simulador />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendario" element={<Calendario />} />
      </Routes>
      <InstallPWA />
    </BrowserRouter>
  )
}
