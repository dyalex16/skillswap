import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const Navbar = ({ backTo, title }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setSidebarOpen(false)
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={`text-sm transition ${
        location.pathname === to
          ? 'text-white font-semibold'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )

  const sidebarLink = (to, label, emoji) => (
    <Link
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm ${
        location.pathname === to
          ? 'bg-indigo-600 text-white font-semibold'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <span>{emoji}</span>
      {label}
    </Link>
  )

  
  return (
    <>
      <nav className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">

        {/* Left side */}
        {backTo ? (
          <Link to={backTo} className="text-sm text-gray-400 hover:text-white transition">
            ← Back
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SkillSwap
            </h1>
          </Link>
        )}

        {/* Center — optional title */}
        {title && (
          <div className="flex items-center gap-2">
            {title.avatarUrl ? (
              <img
                src={title.avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-700"
              />
            ) : (
              <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {title.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-white font-medium">{title.name}</span>
          </div>
        )}

        {/* Right side — desktop links + hamburger */}
        <div className="flex items-center gap-6">
          {/* Desktop links */}
          {!backTo && (
            <div className="hidden md:flex items-center gap-6">
                {/* Avatar */}
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500"
                  />
                ) : (
                  <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              {navLink('/', 'Dashboard')}
              {navLink('/profile', 'Profile')}
              {navLink('/matches', 'Matches')}
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition"
                >
                  Logout
                </button>
              )}
            </div>
          )}

          {/* Hamburger — mobile only */}
          {!backTo && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex flex-col gap-1 p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <span className="w-5 h-0.5 bg-gray-200 rounded" />
              <span className="w-5 h-0.5 bg-gray-200 rounded" />
              <span className="w-5 h-0.5 bg-gray-200 rounded" />
            </button>
          )}

          {/* Back page logo */}
          {backTo && (
            <Link to="/" className="flex items-center gap-2">
              <Logo />
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SkillSwap</h1>
            </Link>
          )}
        </div>

      </nav>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-800 z-50 transform transition-transform duration-300 md:hidden ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>

        {/* Sidebar header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h1 className='text-lg font-bold bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent'>Skillswap</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white text-xl transition"
          >
            ✕
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div>
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar links */}
        <div className="px-3 py-4 space-y-1">
          {sidebarLink('/', 'Dashboard', '🏠')}
          {sidebarLink('/profile', 'Profile', '👤')}
          {sidebarLink('/matches', 'Matches', '🤝')}
        </div>

        {/* Logout */}
        {user && (
          <div className="absolute bottom-6 left-0 right-0 px-3">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Navbar