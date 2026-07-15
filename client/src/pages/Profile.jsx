import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const Profile = () => {
  const { user, updateUser } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', bio: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [skillInput, setSkillInput] = useState({ skillName: '', level: 'Beginner', category: 'Tech' })
  const [wantInput, setWantInput] = useState({ skillName: '', category: 'Tech' })

  const fileInputRef = useRef(null)
  const categories = ['Tech', 'Design', 'Language', 'Music', 'Business', 'Other']
  const levels = ['Beginner', 'Intermediate', 'Expert']

  useEffect(() => {
    document.title = 'Profile — SkillSwap'
  }, [])

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me')
        setProfile(res.data)
        setForm({ name: res.data.name, bio: res.data.bio || '' })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await api.put('/users/me', form)
      setProfile(prev => ({ ...prev, ...res.data }))
      setMessage('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Show preview immediately
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setProfile(prev => ({ ...prev, avatarUrl: res.data.user.avatarUrl }))
      updateUser({ avatarUrl: res.data.user.avatarUrl })
      setMessage('Avatar updated successfully!')
    } catch (err) {
      setError('Failed to upload avatar')
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Add skill
  const handleAddSkill = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users/skills', skillInput)
      const res = await api.get('/users/me')
      setProfile(res.data)
      setSkillInput({ skillName: '', level: 'Beginner', category: 'Tech' })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  // Add want
  const handleAddWant = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users/wants', wantInput)
      const res = await api.get('/users/me')
      setProfile(res.data)
      setWantInput({ skillName: '', category: 'Tech' })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  // Remove skill
  const handleRemoveSkill = async (skillId) => {
    try {
      await api.delete(`/users/skills/${skillId}`)
      setProfile(prev => ({
        ...prev,
        userSkills: prev.userSkills.filter(s => s.skillId !== skillId)
      }))
    } catch (err) {
      console.error(err)
    }
  }

  // Remove want
  const handleRemoveWant = async (skillId) => {
    try {
      await api.delete(`/users/wants/${skillId}`)
      setProfile(prev => ({
        ...prev,
        userWants: prev.userWants.filter(w => w.skillId !== skillId)
      }))
    } catch (err) {
      console.error(err)
    }
  }

  // Get location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.put('/users/me', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setMessage('Location updated successfully!')
        } catch (err) {
          setError('Failed to update location')
        }
      },
      () => setError('Unable to retrieve your location')
    )
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading profile...</p>
    </div>
  )
  

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <Navbar/>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white">Your Profile</h2>
          <p className="text-gray-500 mt-1">Manage your info, skills and location</p>
        </div>

        {/* Feedback */}
        {message && <div className="bg-green-900 border border-green-700 text-green-300 text-sm px-4 py-3 rounded-lg">{message}</div>}
        {error && <div className="bg-red-900 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>}

        {/* Basic Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Info</h3>
            {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {avatarPreview || profile?.avatarUrl ? (
                <img
                  src={avatarPreview || profile.avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500"
                />
              ) : (
                <div className="w-20 h-20 bg-indigo-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.name.charAt(0).toUpperCase()}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">...</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-medium mb-1">{profile?.name}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg transition"
              >
                📷 Change Avatar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Tell others about yourself..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Location */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-1">Location</h3>
          <p className="text-gray-500 text-sm mb-4">Used to find nearby matches</p>
          {profile?.latitude ? (
            <p className="text-green-400 text-sm mb-3">
              ✅ Location set ({profile.latitude.toFixed(2)}, {profile.longitude.toFixed(2)})
            </p>
          ) : (
            <p className="text-gray-500 text-sm mb-3">No location set yet</p>
          )}
          <button
            onClick={handleGetLocation}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-6 py-2.5 rounded-lg transition"
          >
            📍 Update Location
          </button>
        </div>

        {/* Skills I Have */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Skills I Have</h3>

          {/* Existing skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profile?.userSkills.length === 0 && (
              <p className="text-gray-600 text-sm">No skills added yet</p>
            )}
            {profile?.userSkills.map(us => (
              <span
                key={us.skillId}
                className="flex items-center gap-1 bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs px-3 py-1 rounded-full"
              >
                {us.skill.name.charAt(0).toUpperCase() + us.skill.name.slice(1)}
                {us.level && <span className="text-indigo-500">· {us.level}</span>}
                <button
                  onClick={() => handleRemoveSkill(us.skillId)}
                  className="ml-1 text-indigo-400 hover:text-red-400 transition"
                >×</button>
              </span>
            ))}
          </div>

          {/* Add skill form */}
          <form onSubmit={handleAddSkill} className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Skill name"
              value={skillInput.skillName}
              onChange={e => setSkillInput({ ...skillInput, skillName: e.target.value })}
              required
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-32"
            />
            <select
              value={skillInput.level}
              onChange={e => setSkillInput({ ...skillInput, level: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              {levels.map(l => <option key={l}>{l}</option>)}
            </select>
            <select
              value={skillInput.category}
              onChange={e => setSkillInput({ ...skillInput, category: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              + Add
            </button>
          </form>
        </div>

        {/* Skills I Want */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Skills I Want to Learn</h3>

          {/* Existing wants */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profile?.userWants.length === 0 && (
              <p className="text-gray-600 text-sm">No skills added yet</p>
            )}
            {profile?.userWants.map(uw => (
              <span
                key={uw.skillId}
                className="flex items-center gap-1 bg-purple-900 border border-purple-700 text-purple-300 text-xs px-3 py-1 rounded-full"
              >
                {uw.skill.name.charAt(0).toUpperCase() + uw.skill.name.slice(1)}
                <button
                  onClick={() => handleRemoveWant(uw.skillId)}
                  className="ml-1 text-purple-400 hover:text-red-400 transition"
                >×</button>
              </span>
            ))}
          </div>

          {/* Add want form */}
          <form onSubmit={handleAddWant} className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Skill name"
              value={wantInput.skillName}
              onChange={e => setWantInput({ ...wantInput, skillName: e.target.value })}
              required
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 min-w-32"
            />
            <select
              value={wantInput.category}
              onChange={e => setWantInput({ ...wantInput, category: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              + Add
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default Profile;