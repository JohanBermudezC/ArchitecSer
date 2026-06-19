import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import HistoryPage from './pages/HistoryPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import CanchasPage from './pages/CanchasPage'
import BuscarCanchasPage from "./pages/BuscarCanchasPage"
import CrearReservaPage from "./pages/CrearReservaPage"
import ReservasPage from "./pages/ReservasPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/canchas" element={<CanchasPage />} />
        <Route path="/buscar-canchas" element={<BuscarCanchasPage />} />
        <Route path="/crear-reserva" element={<CrearReservaPage />} />
        <Route path="/reservas" element={<ReservasPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
