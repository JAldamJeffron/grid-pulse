import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Predictor } from './pages/Predictor'
import { Login } from './pages/Login'
import { LiveSimulator } from './pages/LiveSimulator'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/predictor" element={<Predictor />} />
        <Route path="/live-simulator" element={<LiveSimulator />} />
        {/* Simple catch-all redirect for now */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
