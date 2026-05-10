import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const Landing = () => {
  useEffect(() => {
    document.title = 'SkillSwap — Connect. Learn. Grow.'
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="px-8 py-5 flex justify-between items-center border-b border-gray-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SkillSwap</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-gray-400 hover:text-white transition px-4 py-2"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-block bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs px-4 py-1.5 rounded-full mb-6">
          🚀 Connect with people who complement your skills
        </div>

        <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          Swap Skills.{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Grow Together.
          </span>
        </h2>

        <p className="text-gray-400 text-lg max-w-xl mb-10">
          SkillSwap matches you with people who have what you want to learn — and want to learn what you have. No money, just knowledge.
        </p>

        <div className="flex items-center gap-4">
          <Link
            to="/register"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
          >
            Get Started — It's Free
          </Link>
          <Link
            to="/login"
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white px-8 py-3 rounded-xl transition text-sm"
          >
            Log In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500 transition">
          <div className="text-3xl mb-4">🧠</div>
          <h3 className="text-white font-semibold text-lg mb-2">Smart Matching</h3>
          <p className="text-gray-400 text-sm">Our algorithm finds people whose skills perfectly complement yours based on what you offer and what you want to learn.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition">
          <div className="text-3xl mb-4">💬</div>
          <h3 className="text-white font-semibold text-lg mb-2">Real-time Chat</h3>
          <p className="text-gray-400 text-sm">Connect instantly with your matches through our built-in chat system and start exchanging knowledge right away.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500 transition">
          <div className="text-3xl mb-4">🎥</div>
          <h3 className="text-white font-semibold text-lg mb-2">Video Sessions</h3>
          <p className="text-gray-400 text-sm">Take your skill swap to the next level with one-click video meetings — no third party apps needed.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-gray-900 py-16 text-center px-6">
        <h3 className="text-3xl font-bold text-white mb-4">Ready to start swapping?</h3>
        <p className="text-gray-400 mb-8">Join SkillSwap today and find your perfect skill match.</p>
        <Link
          to="/register"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
        >
          Create Free Account
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-900 py-6 text-center">
        <p className="text-gray-700 text-xs">SkillSwap © {new Date().getFullYear()} — Connect. Learn. Grow.</p>
      </div>

    </div>
  )
}

export default Landing