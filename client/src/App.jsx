import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Matches from './pages/Matches'
import Chat from './pages/Chat'
import NotFound from './pages/NotFound'

const App = () => {
  return (
    <Routes>
      <Route path="/home" element={<Welcome/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
      <Route path="/chat/:matchId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App