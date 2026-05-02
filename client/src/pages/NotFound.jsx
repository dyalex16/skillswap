import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  useEffect(() => {
    document.title = '404 — SkillSwap'
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          404
        </p>
        <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg transition text-sm font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound