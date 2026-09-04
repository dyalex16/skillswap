import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, X } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const Matches = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [incoming, setIncoming] = useState([])
  const [accepted, setAccepted] = useState([])
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('suggestions')
  const [now, setNow] = useState(Date.now())
  const [insights, setInsights] = useState({})
  const [loadingInsight, setLoadingInsight] = useState({})

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 60000) // every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    document.title = 'Matches — SkillSwap'
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [suggestionsRes, incomingRes, acceptedRes, sentRes, unreadRes] = await Promise.all([
          api.get('/matches'),
          api.get('/matches/incoming'),
          api.get('/matches/accepted'),
          api.get('/matches/sent'),
          api.get('/chat/unread'),
        ])
        setSuggestions(suggestionsRes.data)
        setIncoming(incomingRes.data)
        setAccepted(acceptedRes.data)
        setSentRequests(sentRes.data)
        setUnreadCounts(unreadRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleSendRequest = async (targetUserId) => {
    try {
      const res = await api.post('/matches/request', { targetUserId })
      setSentRequests(prev => [...prev, res.data.match])
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancelRequest = async (matchId, targetUserId) => {
    try {
      await api.delete(`/matches/request/${matchId}`)
      setSentRequests(prev => prev.filter(r => r.id !== matchId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateStatus = async (matchId, status) => {
    try {
      await api.patch(`/matches/${matchId}`, { status })
      if (status === 'accepted') {
        const match = incoming.find(m => m.id === matchId)
        setAccepted(prev => [...prev, { ...match, status: 'accepted' }])
      }
      setIncoming(prev => prev.filter(m => m.id !== matchId))
    } catch (err) {
      console.error(err)
    }
  }

  const getCooldownText = (declinedAt) => {
    const declinedTime = new Date(declinedAt).getTime()
    const aDay = 24 * 60 * 60 * 1000
    const remaining = declinedTime + aDay - now
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const handleCreateMeeting = async (matchId) => {
    try {
      const res = await api.post(`/meetings/${matchId}`)
      window.open(res.data.roomUrl, '_blank')
    } catch (err) {
      console.error(err)
    }
  }

  const fetchInsight = async (matchId) => {
    if (insights[matchId]) return // already fetched
    setLoadingInsight(prev => ({ ...prev, [matchId]: true }))
    try {
      const res = await api.get(`/insights/${matchId}`)
      setInsights(prev => ({ ...prev, [matchId]: res.data }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingInsight(prev => ({ ...prev, [matchId]: false })) 
    }
  }

  const tabs = [
    { key: 'suggestions', label: 'Suggestions', count: suggestions.length },
    { key: 'incoming', label: 'Requests', count: incoming.length },
    { key: 'accepted', label: 'Connected', count: accepted.length },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <Navbar/>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Matches</h2>
          <p className="text-gray-500 mt-1">Connect with people who complement your skills</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900 rounded-2xl p-6 animate-shimmer h-36" />
            ))}
          </div>
        )}

        {/* Suggestions Tab */}
        {!loading && activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-gray-400 text-lg">No suggestions available</p>
                <p className="text-gray-600 text-sm mt-2">Add more skills and wants to find matches</p>
                <Link to="/profile" className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition">
                  Update Profile
                </Link>
              </div>
            )}
            {suggestions.map(s => (
              <div key={s.user.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 mb-3">
                    {s.user.avatarUrl ? (
                      <img
                         src={s.user.avatarUrl}
                         alt="Avatar"
                         className="w-10 h-10 rounded full object-cover border-2 border-indigo-700"
                      />
                    ) : ( 
                      <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold">
                        {s.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{s.user.name}</h3>
                      <p className="text-gray-500 text-xs">{s.distance}</p>
                    </div>
                  </div>
                  <span className="bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs px-3 py-1 rounded-full">
                    Score: {s.score}
                  </span>
                </div>

                {s.user.bio && <p className="text-gray-400 text-sm mb-3">{s.user.bio}</p>}

                <div className="flex flex-wrap gap-2 mb-2">
                  {s.user.userSkills.map(us => (
                    <span key={us.skillId} className="bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs px-2 py-1 rounded-full">
                      {us.skill?.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {s.user.userWants.map(uw => (
                    <span key={uw.skillId} className="bg-purple-900 border border-purple-800 text-purple-300 text-xs px-2 py-1 rounded-full">
                      wants: {uw.skill?.name}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                {(() => {
                  const sentRequest = sentRequests.find(r => r.userBId === s.user.id)

                  if (s.declinedAt) {
                    return (
                      <button
                        disabled
                        className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-500 text-xs px-5 py-2 rounded-lg cursor-not-allowed"
                      >
                        🚫 Declined • Resend in {getCooldownText(s.declinedAt)}
                      </button>
                    )
                  }
                  return sentRequest ? (
                    <button
                      onClick={() => handleCancelRequest(sentRequest.id, s.user.id)}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-red-900 border border-gray-700 hover:border-red-700 text-gray-300 hover:text-red-300 text-xs px-5 py-2 rounded-lg transition"
                    >
                      <X size={14} />
                      Cancel Request
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(s.user.id)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5 py-2 rounded-lg transition"
                    >
                      <UserPlus size={14} />
                      Send Match Request
                    </button> 
                  )
                })()}
              </div>
            ))}
          </div>
        )}

        {/* Incoming Requests Tab */}
        {!loading && activeTab === 'incoming' && (
          <div className="space-y-4">
            {incoming.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-400 text-lg">No incoming requests</p>
              </div>
            )}
            {incoming.map(m => (
              <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition">
                <div className="flex items-center gap-3 mb-3">
                  {m.userA.avatarUrl ? (
                    <img
                      src={m.userA.avatarUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-700"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                      {m.userA.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{m.userA.name}</h3>
                    <p className="text-gray-500 text-xs">Wants to connect with you</p>
                  </div>
                </div>

                {m.userA.bio && <p className="text-gray-400 text-sm mb-3">{m.userA.bio}</p>}

                <div className="flex flex-wrap gap-2 mb-2">
                  {m.userA.userSkills.map(us => (
                    <span key={us.skillId} className="bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs px-2 py-1 rounded-full">
                      {us.skill.name.charAt(0).toUpperCase() + us.skill.name.slice(1)}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {m.userA.userWants.map(uw => (
                    <span key={uw.skillId} className="bg-purple-900 border border-purple-800 text-purple-300 text-xs px-2 py-1 rounded-full">
                      wants: {uw.skill.name.charAt(0).toUpperCase() + uw.skill.name.slice(1)}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(m.id, 'accepted')}
                    className="bg-green-700 hover:bg-green-600 text-white text-xs px-5 py-2 rounded-lg transition"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(m.id, 'declined')}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs px-5 py-2 rounded-lg transition"
                  >
                    ❌ Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connected Tab */}
        {!loading && activeTab === 'accepted' && (
          <div className="space-y-4">
            {accepted.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🤝</p>
                <p className="text-gray-400 text-lg">No connections yet</p>
                <p className="text-gray-600 text-sm mt-2">Accept incoming requests to start connecting</p>
              </div>
            )}
            {accepted.map(m => {
              const other = m.userAId === user.id ? m.userB : m.userA
              const insight = insights[m.id]
              const isLoadingInsight = loadingInsight[m.id]

              return (
                <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500 transition">
                  <div className="flex items-center gap-3 mb-4">
                    {other.avatarUrl ? (
                      <img src={other.avatarUrl} className="w-10 h-10 rounded-full object-cover border-2 border-green-700" />
                    ) : (
                      <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold">
                        {other.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{other.name}</h3>
                      <p className="text-green-400 text-xs">✅ Connected</p>
                    </div>
                  </div>

                  {/* Why This Match */}
                  {!insight && !isLoadingInsight && (
                    <button
                      onClick={() => fetchInsight(m.id)}
                      className="w-full mb-4 bg-gray-800 hover:bg-gray-700 border border-indigo-700 text-indigo-300 text-xs px-4 py-2.5 rounded-xl transition"
                    >
                      ✨ Why This Match?
                    </button>
                  )}

                  {isLoadingInsight && (
                    <div className="mb-4 bg-gray-800 border border-gray-700 rounded-xl p-4 animate-pulse">
                      <div className="h-3 bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-700 rounded w-1/2" />
                    </div>
                  )}

                  {insight && !insight.fallback && (
                    <div className="mb-4 bg-gray-800 border border-indigo-800 rounded-xl p-4">
                      <p className="text-indigo-300 text-xs font-medium mb-2">✨ Why you match</p>
                      <p className="text-gray-300 text-sm mb-3">{insight.explanation}</p>
                      <p className="text-indigo-300 text-xs font-medium mb-2">💬 Conversation starters</p>
                      <ul className="space-y-1">
                        {insight.starters.map((s, i) => (
                          <li key={i} className="text-gray-400 text-xs flex items-start gap-2">
                            <span className="text-indigo-500 mt-0.5">→</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/chat/${m.id}`)}
                      className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5 py-2 rounded-lg transition"
                    >
                      💬 Chat
                      {unreadCounts[m.id] > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCreateMeeting(m.id)}
                      className="bg-purple-700 hover:bg-purple-600 text-white text-xs px-5 py-2 rounded-lg transition"
                    >
                      🎥 Start Meeting
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default Matches