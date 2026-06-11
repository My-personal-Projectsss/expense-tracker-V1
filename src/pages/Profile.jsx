import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import MainLayout from '../layouts/MainLayout'

function Profile() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalSpentThisMonth: 0,
    budget: 0,
    memberSince: ''
  })

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()

    setName(profileData?.name || '')
    setEmail(profileData?.email || user.email)
    setPhone(profileData?.phone || '')
    setAvatarUrl(profileData?.avatar_url || null)

    const { data: allExpenses } = await supabase
      .from('expenses').select('amount').eq('user_id', user.id)

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { data: monthExpenses } = await supabase
      .from('expenses').select('amount').eq('user_id', user.id)
      .gte('date', firstDay).lte('date', lastDay)

    const { data: budgetData } = await supabase
      .from('budgets').select('amount').eq('user_id', user.id).single()

    setStats({
      totalExpenses: allExpenses?.length || 0,
      totalSpentThisMonth: monthExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0,
      budget: budgetData?.amount || 0,
      memberSince: new Date(profileData?.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) { setAvatarFile(file); setAvatarUrl(URL.createObjectURL(file)) }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    const { data: { user } } = await supabase.auth.getUser()
    let newAvatarUrl = avatarUrl

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(filePath, avatarFile, { upsert: true })
      if (uploadError) { setError(uploadError.message); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      newAvatarUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('profiles')
      .update({ name, email, phone, avatar_url: newAvatarUrl })
      .eq('id', user.id)

    if (error) { setError(error.message) }
    else { setSuccess('Profile updated!'); setEditing(false); setAvatarFile(null); fetchProfile() }
    setLoading(false)
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : email?.charAt(0).toUpperCase()

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account details</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {!editing ? (
              <>
                <div className="flex justify-end mb-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm text-gray-400 font-medium hover:text-gray-600 transition cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0 overflow-hidden">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" className="w-14 h-14 object-cover" />
                      : initials
                    }
                  </div>
                  <div className="text-center md:text-left">
                    <p className="font-bold text-gray-800">{name || 'No name set'}</p>
                    <p className="text-sm text-gray-400">{email}</p>
                    {phone && <p className="text-sm text-gray-400">{phone}</p>}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl overflow-hidden">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" className="w-20 h-20 object-cover" />
                        : initials
                      }
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-blue-700 text-xs">
                      +
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">{success}</div>}
                {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">{error}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setEditing(false); setError(''); setSuccess(''); setAvatarFile(null); fetchProfile() }}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-4">Account Stats</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="text-sm font-medium text-gray-800">{stats.memberSince}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                <span className="text-sm text-gray-500">Total Expenses Logged</span>
                <span className="text-sm font-medium text-gray-800">{stats.totalExpenses}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                <span className="text-sm text-gray-500">Total Spent This Month</span>
                <span className="text-sm font-medium text-red-500">${stats.totalSpentThisMonth.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-500">Monthly Budget</span>
                <span className="text-sm font-medium text-gray-800">${stats.budget.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}

export default Profile