import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const Chat = () => {
  const { matchId } = useParams()
  const { user, token } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [matchedUser, setMatchedUser] = useState(null)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    document.title = matchedUser ? `Chat with ${matchedUser.name} — SkillSwap` : 'Chat — SkillSwap'
  }, [matchedUser])

  useEffect(() => {
    // Fetch chat history
    const fetchMessages = async () => {
      try {
        const [messagesRes, matchesRes] = await Promise.all([
          api.get(`/chat/${matchId}`),
          api.get('/matches/accepted'),
        ])

        setMessages(messagesRes.data)

        // Find the other user in this match
        const match = matchesRes.data.find(m => m.id === matchId)
        if (match) {
          const other = match.userAId === user.id ? match.userB : match.userA
          setMatchedUser(other)
        }

        await api.put(`/chat/${matchId}/read`)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Initialize socket
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    
    socketRef.current = io(socketUrl, {
      auth: { token }
    })

    // Join the match room
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_room', matchId)
    })

    // Listen for incoming messages
    socketRef.current.on('receive_message', (message) => {
      setMessages(prev => [...prev, message])
      api.put(`chat/${matchId}/read`)
    })

    // Cleanup on unmount
    return () => {
      socketRef.current.emit('leave_room', matchId)
      socketRef.current.disconnect()
    }
  }, [matchId])

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    socketRef.current.emit('send_message', { matchId, content: input })
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <Navbar backTo="/matches" title={matchedUser} />  

      {/* Chat Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center gap-3">
        {matchedUser?.avatarUrl ? (
          <img 
            src={matchedUser.avatarUrl} 
            alt="Avatar"
            className="w-9 h-9 object-cover rounded-full" 
          />
        ) : (
          <div className="w-9 h-9 bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {matchedUser?.name?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        <div>
          <p className="font-semibold text-white">{matchedUser?.name || 'Loading...'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="font-verdana flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading && (
          <div className="text-center text-gray-500 text-sm">Loading messages...</div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center text-gray-600 text-sm mt-20">
            <p className="text-3xl mb-3">👋</p>
            <p>No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.senderId === user.id

          // Check if this message is on a different day than the previous one
          const showDateSeparator = index === 0 || 
            new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString()

          return (
            <div key={msg.id}>

              {/* Date separator */}
              {showDateSeparator && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-gray-500 text-xs px-2">
                    {formatDate(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
              )}

              {/* Message bubble */}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                }`}>
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-indigo-300' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 w-full bg-gray-900 border-t border-gray-800 px-6 py-4 flex items-center gap-3">
        <input
          autoCapitalize="on"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-40"
        >
          Send
        </button>
      </div>

    </div>
  )
}

export default Chat