import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ skills: 0, wants: 0, matches: 0, incoming: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard — SkillSwap'
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profileRes, matchesRes, incomingRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/matches'),
          api.get('/matches/incoming'),
        ])
        setStats({
          skills: profileRes.data.userSkills.length,
          wants: profileRes.data.userWants.length,
          matches: matchesRes.data.length,
          incoming: incomingRes.data.length,
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <Navbar/>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-indigo-400 text-sm font-medium mb-1">Good to see you back 👋</p>
          <h2 className="text-4xl font-bold text-white">{user?.name}</h2>
          <p className="text-gray-500 mt-2">Here's what's happening with your SkillSwap account.</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900 rounded-2xl p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500 transition">
              <p className="text-gray-400 text-sm mb-2">Skills I Have</p>
              <p className="text-5xl font-bold text-indigo-400">{stats.skills}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition">
              <p className="text-gray-400 text-sm mb-2">Skills I Want</p>
              <p className="text-5xl font-bold text-purple-400">{stats.wants}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500 transition">
              <p className="text-gray-400 text-sm mb-2">Potential Matches</p>
              <p className="text-5xl font-bold text-green-400">{stats.matches}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/profile"
            className="bg-indigo-700 hover:bg-indigo-600 rounded-2xl p-5 transition group"
          >
            <div className="text-2xl mb-3">🧠</div>
            <h4 className="font-semibold text-white">Edit Profile</h4>
            <p className="text-indigo-200 text-xs mt-1">Update your skills</p>
          </Link>

          <Link
            to="/matches"
            className="bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-2xl p-5 transition relative"
          >
            {stats.incoming > 0 && (
              <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
            <div className="text-2xl mb-3">🤝</div>
            <h4 className="font-semibold text-white">View Matches</h4>
            <p className="text-gray-400 text-xs mt-1">See your matches</p>
          </Link>

          <Link
            to="/matches"
            className="bg-gray-900 border border-gray-800 hover:border-green-500 rounded-2xl p-5 transition"
          >
            <div className="text-2xl mb-3">💬</div>
            <h4 className="font-semibold text-white">Messages</h4>
            <p className="text-gray-400 text-xs mt-1">Chat with matches</p>
          </Link>

          <Link
            to="/matches"
            className="bg-gray-900 border border-gray-800 hover:border-yellow-500 rounded-2xl p-5 transition"
          >
            <div className="text-2xl mb-3">🎥</div>
            <h4 className="font-semibold text-white">Meetings</h4>
            <p className="text-gray-400 text-xs mt-1">Start a session</p>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-700 text-xs mt-16">
          SkillSwap © {new Date().getFullYear()} — Connect. Learn. Grow.
        </p>

      </div>
    </div>
  )
}

export default Dashboard